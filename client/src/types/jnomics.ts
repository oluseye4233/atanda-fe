export interface SkillMappings {
  onet: string[];
  sfia: string[];
  wef: string[];
}

export interface JnomicsCard {
  id: string;
  name: string;
  tier: string;
  type: string;
  emoji: string;
  description: string;
  basePts: number;
  persona?: string;
  category?: string;
  multiplier?: string;
  insight?: string;
  mappings?: SkillMappings;
}
