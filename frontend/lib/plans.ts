export const plans = [
	{
		name: "Starter",
		price: 49,
		features: [
			"1,000 job searches/month",
			"500 contact enrichments/month",
			"Basic filters & search",
			"Email support",
			"Export to CSV"
		],
		stripeProductId: "prod_RsP4IJeES8hBDu",
		stripePriceId: "price_1QyeDTGPZxkKVmuncIjFBYj7",
	},
	{
		name: "Professional",
		price: 149,
		features: [
			"10,000 job searches/month",
			"5,000 contact enrichments/month",
			"Advanced filters & search",
			"Priority email support",
			"API access",
			"Team collaboration (5 seats)",
			"Export to CSV & CRM integrations"
		],
		stripeProductId: "prod_RsP2eL9TWCTqFR",
		stripePriceId: "price_1QyeEuGPZxkKVmunwbaiAkaO",
	},
	{
		name: "Enterprise",
		price: 499,
		features: [
			"Unlimited job searches",
			"50,000 contact enrichments/month",
			"Custom filters & workflows",
			"Dedicated support",
			"Full API access",
			"Unlimited team seats",
			"Custom integrations",
			"Advanced analytics",
			"White-label options"
		],
		stripeProductId: "prod_RsP19mrNfkIeXG",
		stripePriceId: "price_1QyeFvGPZxkKVmunS8HJc1OS",
	},
] as const;
