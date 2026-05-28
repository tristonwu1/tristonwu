import type { SchemaTypeDefinition } from "sanity";
import { aboutType } from "./aboutType";
import { workType } from "./workType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [workType, aboutType],
};
