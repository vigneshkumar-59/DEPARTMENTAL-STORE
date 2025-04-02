import { Router } from 'express'
import auth from '../middleware/auth.js'
import { CashOnDeliveryOrderController, getAllOrdersController, getOrderDetailsController, paymentController, updateOrderStatusController, webhookStripe } from '../controllers/order.controller.js'


const orderRouter = Router()

orderRouter.post("/cash-on-delivery",auth,CashOnDeliveryOrderController)
orderRouter.post('/checkout',auth,paymentController)
orderRouter.post('/webhook',webhookStripe)
orderRouter.get("/order-list",auth,getOrderDetailsController)
orderRouter.put('/admin/update-order-status', updateOrderStatusController);
orderRouter.get('/get-all-orders', getAllOrdersController);






export default orderRouter