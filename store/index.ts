import { InMemoryBudgetStore } from "./inMemoryBudgetStore";
import { sampleBudgetData } from "./sampleBudgetData";

export const budgetStore = new InMemoryBudgetStore(sampleBudgetData);

export { InMemoryBudgetStore } from "./inMemoryBudgetStore";
export { sampleBudgetData } from "./sampleBudgetData";
