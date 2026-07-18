export interface GuinProfile {
  user: { id: string; username: string; name: string; role: string | null; department: string | null; seniority: string | null; location: string | null; contextCraftCertLevel: string | null; institution: string | null };
  knight: { current: GuinKnightRank; next: GuinKnightRank | null; progress: number; totalKcseEarned: number };
  stats: { totalKcseEarned: number; sessionsFinished: number; sessionsWon: number; ownedCardsCount: number; publishedSpcsCount: number; endorsementsCount: number };
  kcseRadar: GuinRadarPoint[];
  ownedCards: GuinOwnedCard[];
  publishedSpcs: GuinPublishedSpc[];
  endorsements: GuinEndorsement[];
  recentSessions: GuinRecentSession[];
}

export interface GuinKnightRank { key: string; label: string; min: number; color: string; icon: string; }
export interface GuinRadarPoint { axis: string; value: number; }
export interface GuinOwnedCard { id: string; name: string; pillar: string; type: string; emoji: string; baseKcse: number; description: string; }
export interface GuinPublishedSpc { id: string; title: string; pillar: string; priceCredits: number; kcseScore: number; hiveScore: number; salesCount: number; }
export interface GuinEndorsement { id: string; message: string; createdAt: string; sessionId: string; endorser: { id: string; name: string; username: string; contextCraftCertLevel: string | null } | null; }
export interface GuinRecentSession { id: string; scenarioId: string; kcseScore: number | null; certTierEarned: string | null; finishedAt: string | null; }
export interface CreateEndorsementBody { recipientId: string; sessionId: string; message: string; }
