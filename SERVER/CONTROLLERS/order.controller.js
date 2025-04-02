import Stripe from "../config/stripe.js";
import CartProductModel from "../models/cartproduct.model.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import mongoose from "mongoose";

 export async function CashOnDeliveryOrderController(request,response){
    try {
        const userId = request.userId // auth middleware 
        const { list_items, totalAmt, addressId,subTotalAmt } = request.body 

        const payload = list_items.map(el => {
            return({
                userId : userId,
                orderId : `ORD-${new mongoose.Types.ObjectId()}`,
                productId : el.productId._id, 
                product_details : {
                    name : el.productId.name,
                    image : el.productId.image
                } ,
                paymentId : "",
                payment_status : "CASH ON DELIVERY",
                delivery_address : addressId ,
                subTotalAmt  : subTotalAmt,
                totalAmt  :  totalAmt,
            })
        })

        const generatedOrder = await OrderModel.insertMany(payload)

        ///remove from the cart
        const removeCartItems = await CartProductModel.deleteMany({ userId : userId })
        const updateInUser = await UserModel.updateOne({ _id : userId }, { shopping_cart : []})

        return response.json({
            message : "Order successfully",
            error : false,
            success : true,
            data : generatedOrder
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error ,
            error : true,
            success : false
        })
    }
}

export const pricewithDiscount = (price,dis = 1)=>{
    const discountAmout = Math.ceil((Number(price) * Number(dis)) / 100)
    const actualPrice = Number(price) - Number(discountAmout)
    return actualPrice
}

// export async function paymentController(request,response){
//     try {
//         const userId = request.userId // auth middleware 
//         const { list_items, totalAmt, addressId,subTotalAmt } = request.body 

//         const user = await UserModel.findById(userId)

//         const line_items  = list_items.map(item =>{
//             return{
//                price_data : {
//                     currency : 'inr',
//                     product_data : {
//                         name : item.productId.name,
//                         images : item.productId.image,
//                         metadata : {
//                             productId : item.productId._id
//                         }
//                     },
//                     unit_amount : pricewithDiscount(item.productId.price,item.productId.discount) * 100   
//                },
//                adjustable_quantity : {
//                     enabled : true,
//                     minimum : 1
//                },
//                quantity : item.quantity 
//             }
//         })

//         const params = {
//             submit_type : 'pay',
//             mode : 'payment',
//             payment_method_types : ['card'],
//             customer_email : user.email,
//             metadata : {
//                 userId : userId,
//                 addressId : addressId
//             },
//             line_items : line_items,
//             success_url : `${process.env.FRONTEND_URL}/success`,
//             cancel_url : `${process.env.FRONTEND_URL}/cancel`
//         }

//         const session = await Stripe.checkout.sessions.create(params)

//         return response.status(200).json(session)

//     } catch (error) {
//         console.log(error)
//         return response.status(500).json({            
//             message : error.message || error,
//             error : true,
//             success : false
//         })
//     }
// }





// Create a Stripe checkout session
// export async function paymentController(req, res) {
//     try {
//         const userId = req.userId; // User ID from auth middleware
//         const { list_items, totalAmt, addressId, subTotalAmt } = req.body;

//         // Get the user data to fetch email
//         const user = await UserModel.findById(userId);

//         const line_items = list_items.map(item => {
//             return {
//                 price_data: {
//                     currency: 'inr',
//                     product_data: {
//                         name: item.productId.name,
//                         images: item.productId.image,
//                         metadata: {
//                             productId: item.productId._id
//                         }
//                     },
//                     unit_amount: pricewithDiscount(item.productId.price, item.productId.discount) * 100, // Convert to cents
//                 },
//                 adjustable_quantity: {
//                     enabled: true,
//                     minimum: 1
//                 },
//                 quantity: item.quantity,
//             };
//         });

//         const params = {
//             submit_type: 'pay',
//             mode: 'payment',
//             payment_method_types: ['card'],
//             customer_email: user.email,
//             metadata: {
//                 userId: userId,
//                 addressId: addressId,
//             },
//             line_items: line_items,
//             success_url: `${process.env.FRONTEND_URL}/success`, // Replace with your frontend URL
//             cancel_url: `${process.env.FRONTEND_URL}/cancel`, // Replace with your frontend URL
//         };

//         // Create the checkout session
//         const session = await Stripe.checkout.sessions.create(params);

//         // Send the session ID to the frontend
//         res.status(200).json({ id: session.id });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             message: error.message || error,
//             error: true,
//             success: false,
//         });
//     }
// }



export async function paymentController(request, response) {
    try {
        const userId = request.userId;  
        const { list_items, totalAmt, addressId, subTotalAmt } = request.body;

        // Retrieve user information
        const user = await UserModel.findById(userId); 

        // Create line items for Stripe payment
        const line_items = list_items.map(item => ({
            price_data: {
                currency: 'inr',
                product_data: {
                    name: item.productId.name,
                    images: item.productId.image,
                    metadata: {
                        productId: item.productId._id,
                    },
                },
                unit_amount: pricewithDiscount(item.productId.price, item.productId.discount) * 100,  // Convert to cents
            },
            adjustable_quantity: {
                enabled: true,
                minimum: 1,
            },
            quantity: item.quantity,
        }));

        // Stripe session parameters
        const params = {
            submit_type: 'pay',
            mode: 'payment',
            payment_method_types: ['card'],
            customer_email: user.email,
            metadata: {
                userId: userId,
                addressId: addressId,
            },
            line_items: line_items,
            success_url: `${process.env.FRONTEND_URL}/success`,  
            cancel_url: `${process.env.FRONTEND_URL}/cancel`,    
        };

        // Create a Stripe Checkout session
        const session = await Stripe.checkout.sessions.create(params);

        // Once session is created, proceed to create the order in the database
        const payload = list_items.map(el => ({
            userId: userId,
            orderId: `ORD-${new mongoose.Types.ObjectId()}`,  
            productId: el.productId._id,
            product_details: {
                name: el.productId.name,
                image: el.productId.image,
            },
            paymentId: session.id,  
            payment_status: 'Paid',  
            delivery_address: addressId,
            subTotalAmt: subTotalAmt,
            totalAmt: totalAmt,
        }));

        // Insert the order details into the database
        const generatedOrder = await OrderModel.insertMany(payload);

        // Return the response with Stripe session URL to redirect the user
        return response.status(200).json({
            message: 'Payment session created! Redirect to Stripe for payment.',
            success: true,
            sessionId: session.id,  
        });

    } catch (error) {
        console.error('Payment Controller Error:', error);
        return response.status(500).json({
            message: error.message || error,
            success: false,
        });
    }
}





const getOrderProductItems = async({
    lineItems,
    userId,
    addressId,
    paymentId,
    payment_status,
 })=>{
    const productList = []

    if(lineItems?.data?.length){
        for(const item of lineItems.data){
            const product = await Stripe.products.retrieve(item.price.product)

            const paylod = {
                userId : userId,
                orderId : `ORD-${new mongoose.Types.ObjectId()}`,
                productId : product.metadata.productId, 
                product_details : {
                    name : product.name,
                    image : product.images
                } ,
                paymentId : paymentId,
                payment_status : payment_status,
                delivery_address : addressId,
                subTotalAmt  : Number(item.amount_total / 100),
                totalAmt  :  Number(item.amount_total / 100),
            }

            productList.push(paylod)
        }
    }

    return productList
}

//http://localhost:8080/api/order/webhook
export async function webhookStripe(request,response){
    const event = request.body;
    const endPointSecret = process.env.STRIPE_ENPOINT_WEBHOOK_SECRET_KEY

    console.log("event",event)

    // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const lineItems = await Stripe.checkout.sessions.listLineItems(session.id)
      const userId = session.metadata.userId
      const orderProduct = await getOrderProductItems(
        {
            lineItems : lineItems,
            userId : userId,
            addressId : session.metadata.addressId,
            paymentId  : session.payment_intent,
            payment_status : session.payment_status,
        })
    
      const order = await OrderModel.insertMany(orderProduct)

        console.log(order)
        if(Boolean(order[0])){
            const removeCartItems = await  UserModel.findByIdAndUpdate(userId,{
                shopping_cart : []
            })
            const removeCartProductDB = await CartProductModel.deleteMany({ userId : userId})
        }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  response.json({received: true});
}


export async function getOrderDetailsController(request,response){
    try {
        const userId = request.userId // order id

        const orderlist = await OrderModel.find({ userId : userId }).sort({ createdAt : -1 }).populate('delivery_address')

        return response.json({
            message : "order list",
            data : orderlist,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}


// Controller to get all orders
export async function getAllOrdersController(req, res) {
    try {
        // Fetch all orders
        const orders = await OrderModel.find()
            .populate('userId')           // Populate userId to get user details
            .populate('productId')        // Populate productId to get product details
            .populate('delivery_address') // Populate delivery_address to get address details
            .sort({ createdAt: -1 });     // Optionally sort by creation date in descending order
        
        return res.status(200).json({
            message: "Orders fetched successfully",
            success: true,
            data: orders
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        return res.status(500).json({
            message: error.message || 'Something went wrong while fetching orders.',
            success: false,
        });
    }
}



export async function updateOrderStatusController(request, response) {
    try {
        const { orderId, orderStatus } = request.body; // orderId and new orderStatus are expected in the request body
        const allowedStatuses = ["processing", "shipped", "delivered"]; // Valid order statuses
        
        // Verify if the user is an admin (assuming role is stored in request.user)
        /* if (request.user.role !== 'admin') {
            return response.status(403).json({
                message: 'Permission denied. Only admins can update order status.',
                error: true,
                success: false
            });
        } */

        // Validate the orderStatus
        if (!allowedStatuses.includes(orderStatus)) {
            return response.status(400).json({
                message: 'Invalid order status. Allowed statuses are processing, shipped, or delivered.',
                error: true,
                success: false
            });
        }

        // Find the order by orderId
        const order = await OrderModel.findOne({ orderId: orderId });

        if (!order) {
            return response.status(404).json({
                message: 'Order not found.',
                error: true,
                success: false
            });
        }

        // Update the order status
        order.orderStatus = orderStatus;

        // Save the updated order
        const updatedOrder = await order.save();

        return response.status(200).json({
            message: 'Order status updated successfully',
            data: updatedOrder,
            error: false,
            success: true
        });

    } catch (error) {
        console.error('Error updating order status:', error);
        return response.status(500).json({
            message: error.message || 'Something went wrong',
            error: true,
            success: false
        });
    }
}




