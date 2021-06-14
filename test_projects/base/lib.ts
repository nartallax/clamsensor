export function countPowerOfTwo(num: number): number {
	if(num <= 0){
		throw new Error("Bad input number: " + num);
	}

	let power = 0;
	while(num > 1){
		if(num % 2){
			throw new Error("Is NOT power of two: " + num);
		}

		num /= 2;
		power++;
	}

	return power;
}

export function costWithDiscount(itemCost: number, itemCount: number): number {
	if(itemCount < 0 || itemCost < 0){
		throw new Error("Bad item cost/item count: " + itemCost + ", " + itemCount);
	}
	let discountMultiplier = itemCount >= 100? 0.9: itemCount >= 10? 0.95: 1;
	let baseCost = itemCount * itemCost;
	return baseCost * discountMultiplier;
}