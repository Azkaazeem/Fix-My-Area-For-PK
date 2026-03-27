const UNRESOLVED_DAY_MULTIPLIER = 2;
const EMERGENCY_STATUS_BONUS = 45;

const CATEGORY_BASE_SCORES = {
  Fire: 70,
  "Severe Accident": 64,
  Theft: 52,
  Electricity: 26,
  Gas: 24,
  Water: 18,
  Road: 14,
  Garbage: 10
};

export const getVoteImpact = (votes = 0) => Math.min(36, Math.round(Math.log2((votes || 0) + 1) * 12));

export const calculateIssuePriority = (issue) => {
  const voteScore = getVoteImpact(issue.votes);
  const unresolvedBonus = issue.unresolvedDays * UNRESOLVED_DAY_MULTIPLIER;
  const emergencyBonus = issue.isEmergency ? EMERGENCY_STATUS_BONUS : 0;
  const categoryScore = CATEGORY_BASE_SCORES[issue.category] ?? 0;

  return voteScore + unresolvedBonus + emergencyBonus + categoryScore;
};

export const getPriorityBreakdown = (issue) => {
  const voteScore = getVoteImpact(issue.votes);
  const unresolvedBonus = issue.unresolvedDays * UNRESOLVED_DAY_MULTIPLIER;
  const emergencyBonus = issue.isEmergency ? EMERGENCY_STATUS_BONUS : 0;
  const categoryScore = CATEGORY_BASE_SCORES[issue.category] ?? 0;

  return {
    voteScore,
    unresolvedBonus,
    emergencyBonus,
    categoryScore,
    total: voteScore + unresolvedBonus + emergencyBonus + categoryScore,
    formula: `Vote weight ${voteScore} + Days ${unresolvedBonus} + Severity ${categoryScore} + Emergency ${emergencyBonus}`
  };
};

export const sortIssuesByPriority = (issues) => [...issues].sort((left, right) => calculateIssuePriority(right) - calculateIssuePriority(left));
