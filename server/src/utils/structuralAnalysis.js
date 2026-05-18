const assessStructuralCredibility = (report) => {
  let score = 50;
  const positiveIndicators = [];
  const concernIndicators = [];
  const cbcaCriteria = [];

  const text = report.description || '';
  const textLower = text.toLowerCase();
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;

  // POSITIVE ADJUSTMENTS

  // Multi-sensory detail — genuine witnesses describe beyond visual
  const sensoryWords = [
    'heard', 'smell', 'smelled', 'felt', 'loud', 'quiet',
    'voice', 'shouting', 'whisper', 'cold', 'hot', 'crowded',
    'empty', 'noise', 'sound', 'temperature', 'warm'
  ];
  const sensoryCount = sensoryWords.filter(w => textLower.includes(w)).length;
  if (sensoryCount >= 2) {
    score += 15;
    positiveIndicators.push(
      'Contains multi-sensory detail consistent with genuine witness memory'
    );
    cbcaCriteria.push({
      criterion: 'Quantity of details',
      status: 'Supported',
      observation: 'The narrative includes multiple sensory references beyond a bare event summary.'
    });
  } else {
    cbcaCriteria.push({
      criterion: 'Quantity of details',
      status: 'Limited',
      observation: 'The narrative contains limited sensory grounding.'
    });
  }

  // Spontaneous uncertainty markers — genuine witnesses express doubt
  const uncertaintyWords = [
    'actually', 'i think', 'not sure', 'i believe', 'maybe',
    'approximately', 'something like', 'i am not certain',
    'i cannot be sure', 'probably', 'i think it was',
    'as far as i remember', 'if i recall'
  ];
  if (uncertaintyWords.some(w => textLower.includes(w))) {
    score += 15;
    positiveIndicators.push(
      'Contains natural uncertainty consistent with genuine eyewitness memory'
    );
    cbcaCriteria.push({
      criterion: 'Spontaneous corrections / uncertainty',
      status: 'Supported',
      observation: 'The reporter expresses uncertainty in a natural way rather than presenting absolute certainty.'
    });
  } else {
    cbcaCriteria.push({
      criterion: 'Spontaneous corrections / uncertainty',
      status: 'Limited',
      observation: 'The account does not explicitly show uncertainty markers.'
    });
  }

  // Reporter context field completed — explains why they were present
  if (report.reporter_context && report.reporter_context.length > 20) {
    score += 10;
    positiveIndicators.push(
      'Reporter explained their reason for being at the location'
    );
    cbcaCriteria.push({
      criterion: 'Contextual embedding',
      status: 'Supported',
      observation: 'The reporter provides a reason for being present at the scene.'
    });
  } else {
    cbcaCriteria.push({
      criterion: 'Contextual embedding',
      status: 'Limited',
      observation: 'The account offers little contextual grounding for presence at the scene.'
    });
  }

  // Uncertainty statement field completed — voluntary acknowledgement
  if (report.uncertainty_statement && report.uncertainty_statement.length > 10) {
    score += 10;
    positiveIndicators.push(
      'Reporter voluntarily acknowledged limitations of their account'
    );
    cbcaCriteria.push({
      criterion: 'Self-deprecating / limitation acknowledgement',
      status: 'Supported',
      observation: 'The reporter voluntarily states what they are not fully certain about.'
    });
  } else {
    cbcaCriteria.push({
      criterion: 'Self-deprecating / limitation acknowledgement',
      status: 'Limited',
      observation: 'No clear voluntary limitation statement was provided.'
    });
  }

  // Adequate description length for any category
  if (wordCount > 80) {
    score += 10;
    positiveIndicators.push('Report contains sufficient descriptive detail');
  }

  // Time of day uncertainty — "unsure" is a genuine honest answer
  if (report.time_of_day === 'unsure') {
    score += 5;
    positiveIndicators.push('Reporter acknowledged uncertainty about timing');
  }

  const temporalMarkers = ['before', 'after', 'then', 'later', 'while', 'when', 'during'];
  const temporalCount = temporalMarkers.filter(marker => textLower.includes(marker)).length;
  cbcaCriteria.push({
    criterion: 'Logical / temporal structure',
    status: temporalCount >= 2 ? 'Supported' : 'Limited',
    observation: temporalCount >= 2
      ? 'The description contains temporal connectors that help sequence the events.'
      : 'The description does not strongly sequence events with temporal markers.'
  });

  const complicationMarkers = ['however', 'but', 'suddenly', 'unexpectedly', 'could not', 'because'];
  cbcaCriteria.push({
    criterion: 'Complications / spontaneous development',
    status: complicationMarkers.some(marker => textLower.includes(marker)) ? 'Supported' : 'Limited',
    observation: complicationMarkers.some(marker => textLower.includes(marker))
      ? 'The narrative includes at least one complication or interruption, which often appears in recalled experiences.'
      : 'The narrative does not clearly show a complication or interruption.'
  });

  // NEGATIVE ADJUSTMENTS

  // Severe category with almost no detail — structurally suspicious
  const severeCategories = [
    'SEXUAL_HARASSMENT', 'STAFF_MISCONDUCT',
    'CULT_ACTIVITY', 'WEAPONS', 'GROOMING_CONCERN'
  ];
  if (severeCategories.includes(report.category) && wordCount < 40) {
    score -= 20;
    concernIndicators.push(
      `Very brief description (${wordCount} words) for a serious allegation category`
    );
  }

  // Named individual with almost no surrounding context
  const fullNamePattern = /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g;
  const namesFound = text.match(fullNamePattern) || [];
  if (namesFound.length > 0 && wordCount < 50) {
    score -= 15;
    concernIndicators.push(
      'Names a specific individual with very little supporting contextual detail'
    );
  }

  // Overly formal or legalistic language — inconsistent with natural student writing
  const formalWords = [
    'aforementioned', 'henceforth', 'pursuant', 'hereby',
    'for the avoidance of doubt', 'it should be noted that',
    'with respect to the matter', 'the aforementioned individual'
  ];
  if (formalWords.some(w => textLower.includes(w))) {
    score -= 10;
    concernIndicators.push(
      'Unusually formal or legalistic language inconsistent with natural student writing'
    );
  }

  // Claims total certainty — genuine witnesses almost always have some doubt
  if (report.uncertainty_statement) {
    const totalCertaintyPhrases = [
      'nothing', 'certain about everything',
      'completely sure', 'one hundred percent',
      'absolutely certain', 'no doubt'
    ];
    if (totalCertaintyPhrases.some(p =>
      report.uncertainty_statement.toLowerCase().includes(p)
    )) {
      score -= 10;
      concernIndicators.push(
        'Claims complete certainty — genuine eyewitnesses almost always have some uncertainty'
      );
    }
  }

  // Clamp to valid range
  score = Math.max(0, Math.min(100, score));

  const credibilityTier = score >= 65 ? 'HIGH'
    : score >= 40 ? 'MEDIUM' : 'LOW';

  return {
    score,
    credibilityTier,
    positiveIndicators,
    concernIndicators,
    cbcaCriteria,
    summary: credibilityTier === 'HIGH'
      ? 'The account shows several CBCA-consistent features: contextual grounding, uncertainty, and narrative detail.'
      : credibilityTier === 'MEDIUM'
      ? 'The account shows some CBCA features but remains mixed or incomplete in detail richness.'
      : 'The account lacks several CBCA-style cues and should be corroborated carefully before relying on it.',
    adminNote: credibilityTier === 'LOW'
      ? 'Structural analysis flagged patterns inconsistent with typical ' +
        'genuine witness accounts. Apply additional corroboration caution.'
      : credibilityTier === 'HIGH'
      ? 'Structural analysis found characteristics consistent with ' +
        'genuine witness accounts.'
      : 'Structural analysis is inconclusive. Standard procedures apply.'
  };
};

module.exports = { assessStructuralCredibility };
