const sleep = async (ms) => await new Promise(resolve => setTimeout(resolve, ms));

const resolveCustomerIdsFromEmail = async (email) => {
    let customersData = [];

    if (email.includes('+')) {
        const endPart = email.split('+')[1];
        await sleep(2000); // 2-second delay

        const response = await fetch(`https://api.stripe.com/v1/customers/search?query=email~'${endPart}'`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${process.env.STRIPE_API_KEY}`
            }
        });

        const responseData = await response.json();
        customersData = responseData.data.filter((c) => c.email === email);
    } else {
        await sleep(2000); // 2-second delay

        const response = await fetch(`https://api.stripe.com/v1/customers/search?query=email:'${email}'`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${process.env.STRIPE_API_KEY}`
            }
        });

        const responseData = await response.json();
        customersData = responseData.data;
    }

    return customersData.map(customer => customer.id);
}
exports.resolveCustomerIdsFromEmail = resolveCustomerIdsFromEmail;

const findSubscriptionsFromCustomerId = async (customerId) => {
    await sleep(2000); // 2-second delay

    const response = await fetch(`https://api.stripe.com/v1/subscriptions?customer=${customerId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${process.env.STRIPE_API_KEY}`
        }
    });

    const responseData = await response.json();
    return responseData.data || [];
}
exports.findSubscriptionsFromCustomerId = findSubscriptionsFromCustomerId;

const findActiveSubscriptions = (subscriptions) => {
    return subscriptions.filter(sub => sub.status === 'active' || sub.status === 'trialing' || (sub.cancel_at && sub.current_period_end > Date.now() / 1000));
}
exports.findActiveSubscriptions = findActiveSubscriptions;
