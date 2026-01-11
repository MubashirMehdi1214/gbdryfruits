const cron = require('node-cron');
const Order = require('../models/Order');
const User = require('../models/User');
const Cart = require('../models/Cart');
const { sendAbandonedCheckoutEmail, sendWhatsAppMessage } = require('../utils/notifications');

class AbandonedCheckoutService {
    constructor() {
        this.isRunning = false;
        this.recoveryRules = {
            // First reminder after 1 hour
            firstReminder: {
                delay: 60, // minutes
                email: true,
                sms: false,
                whatsapp: false,
                template: 'firstReminder',
                discount: 0
            },
            // Second reminder after 4 hours with 5% discount
            secondReminder: {
                delay: 240, // minutes
                email: true,
                sms: true,
                whatsapp: true,
                template: 'secondReminder',
                discount: 5
            },
            // Third reminder after 24 hours with 10% discount
            thirdReminder: {
                delay: 1440, // minutes
                email: true,
                sms: true,
                whatsapp: true,
                template: 'thirdReminder',
                discount: 10
            },
            // Final reminder after 48 hours with 15% discount
            finalReminder: {
                delay: 2880, // minutes
                email: true,
                sms: true,
                whatsapp: true,
                template: 'finalReminder',
                discount: 15
            }
        };
    }

    // Start the abandoned checkout service
    start() {
        if (this.isRunning) {
            console.log('Abandoned checkout service is already running');
            return;
        }

        this.isRunning = true;
        console.log('Starting abandoned checkout recovery service...');

        // Run every 30 minutes
        cron.schedule('*/30 * * * *', async () => {
            await this.processAbandonedCheckouts();
        });

        // Run initial check
        this.processAbandonedCheckouts();
    }

    // Stop the service
    stop() {
        this.isRunning = false;
        console.log('Abandoned checkout service stopped');
    }

    // Process abandoned checkouts
    async processAbandonedCheckouts() {
        try {
            console.log('Processing abandoned checkouts...');

            // Find carts that have been abandoned for more than 1 hour
            const abandonedTime = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
            const abandonedCarts = await Cart.find({
                updatedAt: { $lt: abandonedTime },
                items: { $exists: true, $ne: [] },
                recovered: { $ne: true }
            }).populate('userId');

            console.log(`Found ${abandonedCarts.length} abandoned carts to process`);

            for (const cart of abandonedCarts) {
                await this.processCart(cart);
            }

        } catch (error) {
            console.error('Error processing abandoned checkouts:', error);
        }
    }

    // Process individual cart
    async processCart(cart) {
        try {
            const now = new Date();
            const cartAge = Math.floor((now - cart.updatedAt) / (1000 * 60)); // age in minutes
            const user = cart.userId;

            // Check which reminders should be sent
            for (const [ruleName, rule] of Object.entries(this.recoveryRules)) {
                if (cartAge >= rule.delay) {
                    // Check if this reminder has already been sent
                    const reminderKey = `remindersSent.${ruleName}`;
                    if (!cart.get(reminderKey)) {
                        await this.sendReminder(cart, user, rule, ruleName);
                        
                        // Mark reminder as sent
                        cart.set(reminderKey, true);
                        await cart.save();
                    }
                }
            }

            // Mark cart as recovered if it's too old (7 days)
            if (cartAge >= 7 * 24 * 60) { // 7 days
                cart.recovered = true;
                await cart.save();
            }

        } catch (error) {
            console.error(`Error processing cart ${cart._id}:`, error);
        }
    }

    // Send reminder notification
    async sendReminder(cart, user, rule, ruleName) {
        try {
            const cartItems = cart.items;
            const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
            
            // Generate discount code if applicable
            let discountCode = null;
            if (rule.discount > 0) {
                discountCode = await this.generateDiscountCode(user._id, rule.discount, ruleName);
            }

            // Send email
            if (rule.email && user?.email) {
                await this.sendAbandonedEmail(user, cartItems, subtotal, rule, discountCode);
            }

            // Send SMS
            if (rule.sms && user?.phone) {
                await this.sendAbandonedSMS(user, cartItems, subtotal, rule, discountCode);
            }

            // Send WhatsApp
            if (rule.whatsapp && user?.phone) {
                await this.sendAbandonedWhatsApp(user, cartItems, subtotal, rule, discountCode);
            }

            // Log the reminder
            await this.logReminder(cart._id, user._id, ruleName, rule.discount);

            console.log(`Sent ${ruleName} reminder to user ${user._id}`);

        } catch (error) {
            console.error(`Error sending ${ruleName} reminder:`, error);
        }
    }

    // Generate unique discount code
    async generateDiscountCode(userId, discount, ruleName) {
        const prefix = 'RECOVER';
        const timestamp = Date.now().toString(36);
        const userHash = userId.toString(36).substr(-4);
        
        const code = `${prefix}${discount}${timestamp}${userHash}`.toUpperCase();
        
        // Store discount code in database (you would implement this)
        // await DiscountCode.create({
        //     code,
        //     userId,
        //     discount,
        //     ruleName,
        //     expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        //     used: false
        // });

        return code;
    }

    // Send abandoned checkout email
    async sendAbandonedEmail(user, cartItems, subtotal, rule, discountCode) {
        const template = this.getEmailTemplate(rule.template, {
            user,
            cartItems,
            subtotal,
            discount: rule.discount,
            discountCode,
            checkoutUrl: `${process.env.FRONTEND_URL}/checkout-professional.html?recover=${discountCode}`
        });

        // This would use your email service
        // await emailService.sendEmail(user.email, template.subject, template.html);
    }

    // Send abandoned checkout SMS
    async sendAbandonedSMS(user, cartItems, subtotal, rule, discountCode) {
        const message = this.getSMSTemplate(rule.template, {
            user,
            itemCount: cartItems.length,
            subtotal,
            discount: rule.discount,
            discountCode,
            checkoutUrl: `${process.env.FRONTEND_URL}/checkout-professional.html?recover=${discountCode}`
        });

        // This would use your SMS service
        // await smsService.sendSMS(user.phone, message);
    }

    // Send abandoned checkout WhatsApp
    async sendAbandonedWhatsApp(user, cartItems, subtotal, rule, discountCode) {
        const message = this.getWhatsAppTemplate(rule.template, {
            user,
            cartItems,
            subtotal,
            discount: rule.discount,
            discountCode,
            checkoutUrl: `${process.env.FRONTEND_URL}/checkout-professional.html?recover=${discountCode}`
        });

        // This would use your WhatsApp service
        // await whatsappService.sendMessage(user.phone, message);
    }

    // Get email template
    getEmailTemplate(templateType, data) {
        const templates = {
            firstReminder: {
                subject: 'Complete Your Order at GBDRYFRUITS',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: #2D5016; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="margin: 0;">🌰 GBDRYFRUITS</h1>
                            <p style="margin: 10px 0 0 0;">You left something in your cart!</p>
                        </div>
                        <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
                            <h2>Don't Miss Out!</h2>
                            <p>Hi ${data.user.name || 'there'},</p>
                            <p>We noticed you left some delicious items in your cart. Your premium dry fruits are waiting for you!</p>
                            
                            <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                                <h3>Your Cart:</h3>
                                ${data.cartItems.map(item => `
                                    <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                                        <span>${item.name} (${item.quantity}x)</span>
                                        <span>Rs. ${(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                `).join('')}
                                <hr style="margin: 10px 0;">
                                <div style="display: flex; justify-content: space-between; font-weight: bold;">
                                    <span>Total:</span>
                                    <span>Rs. ${data.subtotal.toLocaleString()}</span>
                                </div>
                            </div>
                            
                            <div style="text-align: center;">
                                <a href="${data.checkoutUrl}" style="display: inline-block; padding: 15px 30px; background: #2D5016; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">
                                    Complete Your Order
                                </a>
                            </div>
                            
                            <p style="text-align: center; color: #666; margin-top: 20px;">
                                <small>Your cart is saved for 7 days</small>
                            </p>
                        </div>
                    </div>
                `
            },
            
            secondReminder: {
                subject: '5% Off - Complete Your Order at GBDRYFRUITS',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: #F39C12; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="margin: 0;">🎁 Special Offer!</h1>
                            <p style="margin: 10px 0 0 0;">5% OFF your order - Today only!</p>
                        </div>
                        <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
                            <h2>Your Cart is Waiting!</h2>
                            <p>Hi ${data.user.name || 'there'},</p>
                            <p>Here's a special offer just for you! Complete your order now and save 5%.</p>
                            
                            <div style="background: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
                                <h3 style="color: #856404; margin: 0 0 10px 0;">Use Code:</h3>
                                <div style="font-size: 24px; font-weight: bold; color: #2D5016; background: white; padding: 10px; border-radius: 5px; display: inline-block;">
                                    ${data.discountCode}
                                </div>
                                <p style="margin: 10px 0 0 0; color: #856404;">Save 5% on your order</p>
                            </div>
                            
                            <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                                <h3>Your Cart:</h3>
                                ${data.cartItems.map(item => `
                                    <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                                        <span>${item.name} (${item.quantity}x)</span>
                                        <span>Rs. ${(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                `).join('')}
                                <hr style="margin: 10px 0;">
                                <div style="display: flex; justify-content: space-between; font-weight: bold;">
                                    <span>Subtotal:</span>
                                    <span>Rs. ${data.subtotal.toLocaleString()}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; color: #27AE60;">
                                    <span>Discount (5%):</span>
                                    <span>-Rs. ${Math.round(data.subtotal * 0.05).toLocaleString()}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px;">
                                    <span>Total:</span>
                                    <span>Rs. ${Math.round(data.subtotal * 0.95).toLocaleString()}</span>
                                </div>
                            </div>
                            
                            <div style="text-align: center;">
                                <a href="${data.checkoutUrl}" style="display: inline-block; padding: 15px 30px; background: #F39C12; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">
                                    Get 5% Off Now
                                </a>
                            </div>
                            
                            <p style="text-align: center; color: #e74c3c; margin-top: 20px;">
                                <strong>⏰ Offer expires in 24 hours!</strong>
                            </p>
                        </div>
                    </div>
                `
            },
            
            thirdReminder: {
                subject: '10% OFF - Your Cart is Expiring Soon!',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: #e74c3c; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="margin: 0;">⏰ Last Chance!</h1>
                            <p style="margin: 10px 0 0 0;">10% OFF - Cart expiring soon!</p>
                        </div>
                        <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
                            <h2>Your Cart is Expiring!</h2>
                            <p>Hi ${data.user.name || 'there'},</p>
                            <p>Your cart will expire soon! Here's our best offer - 10% OFF your order.</p>
                            
                            <div style="background: #f8d7da; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
                                <h3 style="color: #721c24; margin: 0 0 10px 0;">Final Offer:</h3>
                                <div style="font-size: 28px; font-weight: bold; color: #2D5016; background: white; padding: 15px; border-radius: 5px; display: inline-block;">
                                    ${data.discountCode}
                                </div>
                                <p style="margin: 10px 0 0 0; color: #721c24;">Save 10% - Best offer!</p>
                            </div>
                            
                            <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                                <h3>Your Cart:</h3>
                                ${data.cartItems.map(item => `
                                    <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                                        <span>${item.name} (${item.quantity}x)</span>
                                        <span>Rs. ${(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                `).join('')}
                                <hr style="margin: 10px 0;">
                                <div style="display: flex; justify-content: space-between; font-weight: bold;">
                                    <span>Subtotal:</span>
                                    <span>Rs. ${data.subtotal.toLocaleString()}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; color: #27AE60;">
                                    <span>Discount (10%):</span>
                                    <span>-Rs. ${Math.round(data.subtotal * 0.10).toLocaleString()}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 20px;">
                                    <span>Total:</span>
                                    <span>Rs. ${Math.round(data.subtotal * 0.90).toLocaleString()}</span>
                                </div>
                            </div>
                            
                            <div style="text-align: center;">
                                <a href="${data.checkoutUrl}" style="display: inline-block; padding: 15px 30px; background: #e74c3c; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">
                                    Save 10% Now
                                </a>
                            </div>
                            
                            <p style="text-align: center; color: #e74c3c; margin-top: 20px;">
                                <strong>⏰ Cart expires in 48 hours!</strong>
                            </p>
                        </div>
                    </div>
                `
            },
            
            finalReminder: {
                subject: '15% OFF - Your Cart Expires Today!',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: #8B4513; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="margin: 0;">🔥 FINAL OFFER!</h1>
                            <p style="margin: 10px 0 0 0;">15% OFF - Cart expires TODAY!</p>
                        </div>
                        <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
                            <h2>Don't Let It Expire!</h2>
                            <p>Hi ${data.user.name || 'there'},</p>
                            <p>This is your final chance! Your cart expires today. Get 15% OFF - our biggest discount!</p>
                            
                            <div style="background: #8B4513; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
                                <h3 style="color: white; margin: 0 0 10px 0;">🎁 MEGA DISCOUNT:</h3>
                                <div style="font-size: 32px; font-weight: bold; color: white; background: #2D5016; padding: 20px; border-radius: 5px; display: inline-block;">
                                    ${data.discountCode}
                                </div>
                                <p style="margin: 10px 0 0 0; color: white;">Save 15% - Final offer!</p>
                            </div>
                            
                            <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                                <h3>Your Cart:</h3>
                                ${data.cartItems.map(item => `
                                    <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                                        <span>${item.name} (${item.quantity}x)</span>
                                        <span>Rs. ${(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                `).join('')}
                                <hr style="margin: 10px 0;">
                                <div style="display: flex; justify-content: space-between; font-weight: bold;">
                                    <span>Subtotal:</span>
                                    <span>Rs. ${data.subtotal.toLocaleString()}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; color: #27AE60;">
                                    <span>Discount (15%):</span>
                                    <span>-Rs. ${Math.round(data.subtotal * 0.15).toLocaleString()}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 22px;">
                                    <span>Total:</span>
                                    <span>Rs. ${Math.round(data.subtotal * 0.85).toLocaleString()}</span>
                                </div>
                            </div>
                            
                            <div style="text-align: center;">
                                <a href="${data.checkoutUrl}" style="display: inline-block; padding: 15px 30px; background: #8B4513; color: white; text-decoration: none; border-radius: 5px; font-size: 18px;">
                                    Save 15% - Final Chance!
                                </a>
                            </div>
                            
                            <p style="text-align: center; color: #e74c3c; margin-top: 20px;">
                                <strong>⏰ EXPIRES TODAY!</strong>
                            </p>
                        </div>
                    </div>
                `
            }
        };

        return templates[templateType] || templates.firstReminder;
    }

    // Get SMS template
    getSMSTemplate(templateType, data) {
        const templates = {
            firstReminder: `GBDRYFRUITS: You left items in your cart! Complete your order now: ${data.checkoutUrl}`,
            secondReminder: `GBDRYFRUITS: 5% OFF your order! Use code ${data.discountCode}. Cart expires soon: ${data.checkoutUrl}`,
            thirdReminder: `GBDRYFRUITS: 10% OFF - Final offer! Use code ${data.discountCode}. Cart expires in 48h: ${data.checkoutUrl}`,
            finalReminder: `GBDRYFRUITS: 15% OFF - Cart expires TODAY! Use code ${data.discountCode}. Last chance: ${data.checkoutUrl}`
        };

        return templates[templateType] || templates.firstReminder;
    }

    // Get WhatsApp template
    getWhatsAppTemplate(templateType, data) {
        const templates = {
            firstReminder: `
🌰 *GBDRYFRUITS - Cart Reminder*

Hi ${data.user.name || 'there'}! 👋

You left some delicious items in your cart! 🛒

*Your Cart:*
${data.cartItems.map(item => `• ${item.name} (${item.quantity}x)`).join('\n')}

*Total:* Rs. ${data.subtotal.toLocaleString()}

Complete your order now:
${data.checkoutUrl}

Your cart is saved for 7 days!
            `,
            
            secondReminder: `
🎁 *GBDRYFRUITS - Special Offer!*

Hi ${data.user.name || 'there'}! 🎉

Here's a special 5% discount just for you! 💰

*Discount Code:* ${data.discountCode}
*Your Cart:*
${data.cartItems.map(item => `• ${item.name} (${item.quantity}x)`).join('\n')}

*Total:* Rs. ${data.subtotal.toLocaleString()}
*With Discount:* Rs. ${Math.round(data.subtotal * 0.95).toLocaleString()}

Shop now: ${data.checkoutUrl}

⏰ Offer expires in 24 hours!
            `,
            
            thirdReminder: `
⏰ *GBDRYFRUITS - Final Offer!*

Hi ${data.user.name || 'there'}! 

Your cart is expiring soon! Here's our best offer:

🎉 *10% OFF* - Best discount!

*Discount Code:* ${data.discountCode}
*Your Cart:*
${data.cartItems.map(item => `• ${item.name} (${item.quantity}x)`).join('\n')}

*Total:* Rs. ${data.subtotal.toLocaleString()}
*With Discount:* Rs. ${Math.round(data.subtotal * 0.90).toLocaleString()}

Shop now: ${data.checkoutUrl}

⏰ Cart expires in 48 hours!
            `,
            
            finalReminder: 
🔥 *GBDRYFRUITS - FINAL CHANCE!*

Hi ${data.user.name || 'there'}! 

Your cart expires TODAY! This is your final chance:

🎁 *15% OFF* - MEGA DISCOUNT!

*Discount Code:* ${data.discountCode}
*Your Cart:*
${data.cartItems.map(item => `• ${item.name} (${item.quantity}x)`).join('\n')}

*Total:* Rs. ${data.subtotal.toLocaleString()}
*With Discount:* Rs. ${Math.round(data.subtotal * 0.85).toLocaleString()}

Shop NOW: ${data.checkoutUrl}

⏰ EXPIRES TODAY! Don't miss out!
            `
        };

        return templates[templateType] || templates.firstReminder;
    }

    // Log reminder sent
    async logReminder(cartId, userId, ruleName, discount) {
        try {
            // This would log to your analytics or logging system
            console.log(`Reminder logged: Cart ${cartId}, User ${userId}, Rule ${ruleName}, Discount ${discount}%`);
            
            // You could also store this in a database for analytics
            // await ReminderLog.create({
            //     cartId,
            //     userId,
            //     ruleName,
            //     discount,
            //     sentAt: new Date()
            // });
        } catch (error) {
            console.error('Error logging reminder:', error);
        }
    }

    // Get recovery statistics
    async getRecoveryStats(days = 30) {
        try {
            const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
            
            // This would query your analytics database
            const stats = {
                totalAbandonedCarts: 0,
                recoveredCarts: 0,
                recoveryRate: 0,
                totalRevenue: 0,
                averageOrderValue: 0,
                remindersSent: {
                    firstReminder: 0,
                    secondReminder: 0,
                    thirdReminder: 0,
                    finalReminder: 0
                }
            };

            return stats;
        } catch (error) {
            console.error('Error getting recovery stats:', error);
            return null;
        }
    }

    // Manually trigger recovery for a specific cart
    async triggerRecovery(cartId, ruleName = 'firstReminder') {
        try {
            const cart = await Cart.findById(cartId).populate('userId');
            if (!cart) {
                throw new Error('Cart not found');
            }

            const rule = this.recoveryRules[ruleName];
            if (!rule) {
                throw new Error('Invalid rule name');
            }

            await this.sendReminder(cart, cart.userId, rule, ruleName);
            
            // Mark reminder as sent
            const reminderKey = `remindersSent.${ruleName}`;
            cart.set(reminderKey, true);
            await cart.save();

            console.log(`Manual recovery triggered for cart ${cartId} with rule ${ruleName}`);
            return true;
        } catch (error) {
            console.error('Error triggering manual recovery:', error);
            return false;
        }
    }
}

module.exports = AbandonedCheckoutService;
