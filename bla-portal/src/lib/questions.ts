export type QuestionCategory =
  | 'road_signs'
  | 'right_of_way'
  | 'driving_rules'
  | 'roundabouts'
  | 'speed_limits'
  | 'alcohol_drugs'
  | 'safety'
  | 'school_zones';

export interface Question {
  id: string;
  question: string;
  image?: string;
  options: string[];
  correctAnswer: number; // 0-based index
  category: QuestionCategory;
  explanation?: string;
}

export const categoryLabels: Record<QuestionCategory, string> = {
  road_signs: 'Road Signs',
  right_of_way: 'Right of Way',
  driving_rules: 'Driving Rules',
  roundabouts: 'Roundabouts',
  speed_limits: 'Speed Limits',
  alcohol_drugs: 'Alcohol & Drugs',
  safety: 'Safety',
  school_zones: 'School Zones',
};

export const questions: Question[] = [
  // Road Signs
  {
    id: 'rs-1',
    question: 'What does a red octagonal sign mean?',
    options: ['Yield', 'Stop completely', 'Speed limit ahead', 'No entry'],
    correctAnswer: 1,
    category: 'road_signs',
    explanation: 'A red octagonal sign is a STOP sign. You must come to a complete stop.',
  },
  {
    id: 'rs-2',
    question: 'What does a triangular sign pointing downward indicate?',
    options: ['Stop', 'Yield/Give way', 'Pedestrian crossing', 'Road narrows'],
    correctAnswer: 1,
    category: 'road_signs',
    explanation: 'An inverted triangle means you must yield to other traffic.',
  },
  {
    id: 'rs-3',
    question: 'A circular sign with a red border and diagonal line through a "P" means:',
    options: ['Parking allowed', 'No parking', 'Paid parking only', 'Parallel parking only'],
    correctAnswer: 1,
    category: 'road_signs',
    explanation: 'A red circle with a diagonal line indicates prohibition. "P" crossed out means no parking.',
  },
  {
    id: 'rs-4',
    question: 'What does a blue circular sign with a white arrow pointing up mean?',
    options: ['One-way street ahead', 'Proceed straight only', 'Highway ahead', 'No U-turn'],
    correctAnswer: 1,
    category: 'road_signs',
    explanation: 'Blue circular signs give mandatory instructions. An upward arrow means proceed straight only.',
  },
  {
    id: 'rs-5',
    question: 'A yellow diamond-shaped sign typically indicates:',
    options: ['Regulatory instruction', 'Warning of hazard ahead', 'Information', 'Speed limit'],
    correctAnswer: 1,
    category: 'road_signs',
    explanation: 'Yellow diamond signs are warning signs alerting drivers to potential hazards.',
  },

  // Right of Way
  {
    id: 'row-1',
    question: 'At an uncontrolled intersection, who has the right of way?',
    options: [
      'The vehicle on the left',
      'The vehicle on the right',
      'The faster vehicle',
      'The larger vehicle',
    ],
    correctAnswer: 1,
    category: 'right_of_way',
    explanation: 'At uncontrolled intersections, yield to vehicles approaching from your right.',
  },
  {
    id: 'row-2',
    question: 'When a pedestrian is in a marked crosswalk, you must:',
    options: [
      'Honk to warn them',
      'Slow down and proceed carefully',
      'Stop and yield to the pedestrian',
      'Swerve around them',
    ],
    correctAnswer: 2,
    category: 'right_of_way',
    explanation: 'Pedestrians in crosswalks always have the right of way. You must stop.',
  },
  {
    id: 'row-3',
    question: 'When entering a main road from a side road, you should:',
    options: [
      'Proceed quickly to avoid holding up traffic',
      'Give way to traffic on the main road',
      'Sound your horn before entering',
      'Flash your headlights',
    ],
    correctAnswer: 1,
    category: 'right_of_way',
    explanation: 'Traffic on main roads has priority. Always give way when entering from a side road.',
  },
  {
    id: 'row-4',
    question: 'Emergency vehicles with sirens and lights on have:',
    options: [
      'Right of way only on highways',
      'Priority over all other traffic',
      'Right of way only if approaching from behind',
      'No special privileges',
    ],
    correctAnswer: 1,
    category: 'right_of_way',
    explanation: 'Emergency vehicles always have priority. Pull over safely and let them pass.',
  },

  // Driving Rules (Left-hand driving)
  {
    id: 'dr-1',
    question: 'In Barbados, vehicles drive on which side of the road?',
    options: ['Right side', 'Left side', 'Either side', 'Center'],
    correctAnswer: 1,
    category: 'driving_rules',
    explanation: 'Barbados follows the British system of driving on the left side of the road.',
  },
  {
    id: 'dr-2',
    question: 'When overtaking another vehicle, you should pass on their:',
    options: ['Left side', 'Right side', 'Either side', 'Only on highways'],
    correctAnswer: 1,
    category: 'driving_rules',
    explanation: 'In left-hand traffic countries, overtaking is done on the right side.',
  },
  {
    id: 'dr-3',
    question: 'Using a mobile phone while driving is:',
    options: [
      'Permitted with one hand on the wheel',
      'Allowed only for emergencies',
      'Illegal unless using hands-free',
      'Permitted at traffic lights',
    ],
    correctAnswer: 2,
    category: 'driving_rules',
    explanation: 'Using a handheld mobile phone while driving is illegal. Hands-free devices are permitted.',
  },
  {
    id: 'dr-4',
    question: 'The minimum age to obtain a learner\'s permit in Barbados is:',
    options: ['15 years', '16 years', '17 years', '18 years'],
    correctAnswer: 1,
    category: 'driving_rules',
    explanation: 'You must be at least 16 years old to apply for a learner\'s permit.',
  },
  {
    id: 'dr-5',
    question: 'A learner driver must be accompanied by:',
    options: [
      'Any licensed driver',
      'A driver with at least 2 years experience',
      'A driving instructor only',
      'A driver over 25 years old',
    ],
    correctAnswer: 1,
    category: 'driving_rules',
    explanation: 'Learner drivers must be supervised by a licensed driver with at least 2 years of experience.',
  },

  // Roundabouts
  {
    id: 'rb-1',
    question: 'When approaching a roundabout, you should:',
    options: [
      'Speed up to merge quickly',
      'Give way to traffic already in the roundabout',
      'Stop completely before entering',
      'Honk to alert other drivers',
    ],
    correctAnswer: 1,
    category: 'roundabouts',
    explanation: 'Traffic already in the roundabout has the right of way. Yield before entering.',
  },
  {
    id: 'rb-2',
    question: 'In Barbados, traffic in a roundabout moves:',
    options: ['Counter-clockwise', 'Clockwise', 'Either direction', 'Depends on the roundabout'],
    correctAnswer: 1,
    category: 'roundabouts',
    explanation: 'In left-hand traffic countries, roundabout traffic flows clockwise.',
  },
  {
    id: 'rb-3',
    question: 'If taking the first exit at a roundabout, you should signal:',
    options: ['Right before entering', 'Left before entering', 'No signal needed', 'Right while exiting'],
    correctAnswer: 1,
    category: 'roundabouts',
    explanation: 'Signal left (in left-hand traffic) to indicate you\'re taking the first exit.',
  },
  {
    id: 'rb-4',
    question: 'When going straight through a roundabout, when should you signal?',
    options: [
      'Upon entering',
      'Just before your exit',
      'Throughout the roundabout',
      'No signal required for straight',
    ],
    correctAnswer: 1,
    category: 'roundabouts',
    explanation: 'Signal left just before your exit to let other drivers know you\'re leaving.',
  },

  // Speed Limits
  {
    id: 'sl-1',
    question: 'The general speed limit in built-up areas in Barbados is:',
    options: ['20 km/h', '40 km/h', '60 km/h', '80 km/h'],
    correctAnswer: 1,
    category: 'speed_limits',
    explanation: 'The default speed limit in built-up/urban areas is 40 km/h unless otherwise posted.',
  },
  {
    id: 'sl-2',
    question: 'The maximum speed limit on highways in Barbados is:',
    options: ['60 km/h', '80 km/h', '100 km/h', '120 km/h'],
    correctAnswer: 1,
    category: 'speed_limits',
    explanation: 'The maximum speed limit on highways is 80 km/h.',
  },
  {
    id: 'sl-3',
    question: 'In adverse weather conditions, you should:',
    options: [
      'Maintain the posted speed limit',
      'Drive below the posted limit',
      'Use hazard lights and maintain speed',
      'Speed up to get through quickly',
    ],
    correctAnswer: 1,
    category: 'speed_limits',
    explanation: 'Reduce speed in rain, fog, or other adverse conditions for safety.',
  },
  {
    id: 'sl-4',
    question: 'Speed limit signs show the:',
    options: [
      'Minimum speed allowed',
      'Maximum speed allowed',
      'Recommended speed',
      'Average traffic speed',
    ],
    correctAnswer: 1,
    category: 'speed_limits',
    explanation: 'Speed limit signs indicate the maximum legal speed for that road.',
  },

  // Alcohol & Drugs
  {
    id: 'ad-1',
    question: 'The legal blood alcohol limit for drivers in Barbados is:',
    options: ['0.00%', '0.05%', '0.08%', '0.10%'],
    correctAnswer: 2,
    category: 'alcohol_drugs',
    explanation: 'The legal blood alcohol concentration limit is 0.08% (80mg per 100ml of blood).',
  },
  {
    id: 'ad-2',
    question: 'Driving under the influence of drugs is:',
    options: [
      'Legal if prescribed by a doctor',
      'Only illegal for recreational drugs',
      'Illegal if it impairs your driving',
      'Legal for small amounts',
    ],
    correctAnswer: 2,
    category: 'alcohol_drugs',
    explanation: 'Any substance that impairs your ability to drive safely is illegal, including some medications.',
  },
  {
    id: 'ad-3',
    question: 'Refusing a breathalyzer test when requested by police:',
    options: [
      'Is your legal right',
      'Results in automatic penalties',
      'Requires a court order',
      'Has no consequences',
    ],
    correctAnswer: 1,
    category: 'alcohol_drugs',
    explanation: 'Refusing a breathalyzer test can result in automatic license suspension and penalties.',
  },

  // Safety
  {
    id: 'sf-1',
    question: 'Seat belts must be worn by:',
    options: [
      'Driver only',
      'Front seat passengers only',
      'All occupants where seat belts are fitted',
      'Only on highways',
    ],
    correctAnswer: 2,
    category: 'safety',
    explanation: 'All vehicle occupants must wear seat belts where they are provided.',
  },
  {
    id: 'sf-2',
    question: 'Children under what age should use appropriate child restraints?',
    options: ['3 years', '5 years', '8 years', '12 years'],
    correctAnswer: 2,
    category: 'safety',
    explanation: 'Children under 8 years old should use appropriate child safety seats or booster seats.',
  },
  {
    id: 'sf-3',
    question: 'The minimum safe following distance in good conditions is:',
    options: ['1 second', '2 seconds', '3 seconds', '5 seconds'],
    correctAnswer: 1,
    category: 'safety',
    explanation: 'Maintain at least a 2-second gap behind the vehicle in front in good conditions.',
  },
  {
    id: 'sf-4',
    question: 'When should you use your headlights?',
    options: [
      'Only at night',
      'From sunset to sunrise and in poor visibility',
      'Only in rain',
      'Whenever you want',
    ],
    correctAnswer: 1,
    category: 'safety',
    explanation: 'Headlights must be used from sunset to sunrise and whenever visibility is reduced.',
  },
  {
    id: 'sf-5',
    question: 'If your vehicle breaks down on the highway, you should:',
    options: [
      'Stay in the vehicle with hazard lights on',
      'Walk on the highway to get help',
      'Move to the hard shoulder and place warning triangle',
      'Wait in the driving lane',
    ],
    correctAnswer: 2,
    category: 'safety',
    explanation: 'Pull to the hard shoulder, turn on hazards, and place a warning triangle behind your vehicle.',
  },

  // School Zones
  {
    id: 'sz-1',
    question: 'When passing a school during school hours, you should:',
    options: [
      'Maintain normal speed',
      'Reduce speed and watch for children',
      'Sound horn to warn children',
      'Speed up to pass quickly',
    ],
    correctAnswer: 1,
    category: 'school_zones',
    explanation: 'Always reduce speed in school zones and be alert for children crossing.',
  },
  {
    id: 'sz-2',
    question: 'School zone speed limits typically apply:',
    options: [
      'All day, every day',
      'During school hours on school days',
      'Only in the morning',
      'Only when children are visible',
    ],
    correctAnswer: 1,
    category: 'school_zones',
    explanation: 'School zone restrictions apply during posted school hours on school days.',
  },
  {
    id: 'sz-3',
    question: 'When a school bus has stopped to pick up or drop off children, you should:',
    options: [
      'Pass carefully on the left',
      'Stop until the bus moves',
      'Honk and proceed',
      'Flash your lights',
    ],
    correctAnswer: 1,
    category: 'school_zones',
    explanation: 'Stop and wait when a school bus is loading or unloading children.',
  },
];

export function getRandomQuestions(count: number = 20): Question[] {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function calculateResults(
  answers: Record<string, number>,
  questionSet: Question[]
): {
  score: number;
  passed: boolean;
  total: number;
  correct: number;
  categoryBreakdown: Record<QuestionCategory, { correct: number; total: number }>;
  incorrectQuestions: Question[];
} {
  const categoryBreakdown: Record<QuestionCategory, { correct: number; total: number }> = {
    road_signs: { correct: 0, total: 0 },
    right_of_way: { correct: 0, total: 0 },
    driving_rules: { correct: 0, total: 0 },
    roundabouts: { correct: 0, total: 0 },
    speed_limits: { correct: 0, total: 0 },
    alcohol_drugs: { correct: 0, total: 0 },
    safety: { correct: 0, total: 0 },
    school_zones: { correct: 0, total: 0 },
  };

  let correct = 0;
  const incorrectQuestions: Question[] = [];

  questionSet.forEach((question) => {
    categoryBreakdown[question.category].total++;
    const userAnswer = answers[question.id];

    if (userAnswer === question.correctAnswer) {
      correct++;
      categoryBreakdown[question.category].correct++;
    } else {
      incorrectQuestions.push(question);
    }
  });

  const score = Math.round((correct / questionSet.length) * 100);
  const passed = score >= 70;

  return {
    score,
    passed,
    total: questionSet.length,
    correct,
    categoryBreakdown,
    incorrectQuestions,
  };
}
