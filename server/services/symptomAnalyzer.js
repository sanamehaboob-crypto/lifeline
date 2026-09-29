const OpenAI = require('openai');

// ============================================================
// RULE-BASED FALLBACK ANALYZER
// ============================================================
const symptomRules = [
  {
    keywords: ['chest pain', 'chest tightness', 'heart', 'cardiac', 'heart attack'],
    condition: 'Possible Cardiac Event',
    urgency: 'Emergency',
    careType: 'Emergency Room',
    description: 'Chest pain or tightness may indicate a cardiac event. Seek immediate emergency care.',
  },
  {
    keywords: ['difficulty breathing', 'shortness of breath', 'can\'t breathe', 'breathing problem', 'breathless'],
    condition: 'Respiratory Distress',
    urgency: 'Emergency',
    careType: 'Emergency Room',
    description: 'Difficulty breathing requires immediate medical evaluation.',
  },
  {
    keywords: ['stroke', 'face drooping', 'arm weakness', 'speech difficulty', 'numbness one side', 'slurred speech'],
    condition: 'Possible Stroke',
    urgency: 'Emergency',
    careType: 'Emergency Room',
    description: 'Stroke symptoms require immediate emergency treatment. Time is critical.',
  },
  {
    keywords: ['severe bleeding', 'heavy bleeding', 'uncontrollable bleeding', 'blood loss'],
    condition: 'Severe Hemorrhage',
    urgency: 'Emergency',
    careType: 'Emergency Room',
    description: 'Severe bleeding needs immediate emergency intervention.',
  },
  {
    keywords: ['unconscious', 'fainted', 'passed out', 'unresponsive', 'seizure', 'convulsion'],
    condition: 'Loss of Consciousness / Seizure',
    urgency: 'Emergency',
    careType: 'Emergency Room',
    description: 'Loss of consciousness or seizures require immediate emergency care.',
  },
  {
    keywords: ['severe abdominal pain', 'stomach pain severe', 'appendicitis', 'sharp stomach pain'],
    condition: 'Possible Appendicitis / Acute Abdomen',
    urgency: 'Emergency',
    careType: 'Emergency Room',
    description: 'Severe abdominal pain may indicate appendicitis or another surgical emergency.',
  },
  {
    keywords: ['high fever', 'fever above 103', 'fever 104', 'very high temperature', 'burning fever'],
    condition: 'High-Grade Fever',
    urgency: 'Medium',
    careType: 'General Hospital',
    description: 'High fever may indicate a serious infection requiring hospital evaluation.',
  },
  {
    keywords: ['fever', 'temperature', 'chills', 'body ache', 'flu'],
    condition: 'Possible Viral Infection / Flu',
    urgency: 'Medium',
    careType: 'General Hospital',
    description: 'Fever with body ache suggests viral infection. Medical evaluation is recommended.',
  },
  {
    keywords: ['fracture', 'broken bone', 'bone injury', 'can\'t move', 'deformity', 'swollen joint'],
    condition: 'Possible Fracture',
    urgency: 'Medium',
    careType: 'General Hospital',
    description: 'A suspected fracture needs X-ray and orthopedic evaluation.',
  },
  {
    keywords: ['vomiting blood', 'blood in stool', 'bloody diarrhea'],
    condition: 'Gastrointestinal Bleeding',
    urgency: 'Emergency',
    careType: 'Emergency Room',
    description: 'Blood in vomit or stool may indicate serious internal bleeding.',
  },
  {
    keywords: ['allergic reaction', 'swelling face', 'hives', 'anaphylaxis', 'throat swelling'],
    condition: 'Severe Allergic Reaction',
    urgency: 'Emergency',
    careType: 'Emergency Room',
    description: 'Severe allergic reactions can be life-threatening. Seek immediate help.',
  },
  {
    keywords: ['moderate pain', 'pain', 'ache', 'hurts', 'sore'],
    condition: 'Pain Assessment Needed',
    urgency: 'Medium',
    careType: 'General Hospital',
    description: 'Persistent pain should be evaluated by a healthcare professional.',
  },
  {
    keywords: ['headache', 'head pain', 'migraine'],
    condition: 'Tension Headache / Migraine',
    urgency: 'Low',
    careType: 'Clinic',
    description: 'Headaches are common but persistent or severe headaches should be evaluated.',
  },
  {
    keywords: ['cough', 'sore throat', 'runny nose', 'cold', 'congestion', 'sneezing'],
    condition: 'Common Cold / Upper Respiratory Infection',
    urgency: 'Low',
    careType: 'Clinic',
    description: 'Common cold symptoms usually resolve on their own. Visit a clinic if symptoms persist.',
  },
  {
    keywords: ['nausea', 'vomiting', 'diarrhea', 'stomach upset', 'indigestion'],
    condition: 'Gastrointestinal Distress',
    urgency: 'Low',
    careType: 'Clinic',
    description: 'Mild GI symptoms can often be managed with rest and hydration. See a doctor if they persist.',
  },
  {
    keywords: ['rash', 'skin irritation', 'itching', 'hives mild', 'skin redness'],
    condition: 'Dermatological Issue',
    urgency: 'Low',
    careType: 'Clinic',
    description: 'Skin issues should be evaluated by a healthcare provider if persistent.',
  },
  {
    keywords: ['back pain', 'lower back', 'spine pain'],
    condition: 'Musculoskeletal Pain',
    urgency: 'Low',
    careType: 'Clinic',
    description: 'Back pain is common and can usually be managed with rest and over-the-counter medications.',
  },
  {
    keywords: ['anxiety', 'panic', 'stress', 'can\'t sleep', 'insomnia', 'depression', 'mental health'],
    condition: 'Mental Health Concern',
    urgency: 'Medium',
    careType: 'General Hospital',
    description: 'Mental health concerns are important. Please speak with a healthcare professional.',
  },
  {
    keywords: ['burn', 'scalded', 'burned'],
    condition: 'Burn Injury',
    urgency: 'Medium',
    careType: 'General Hospital',
    description: 'Burns require medical evaluation to determine severity and appropriate treatment.',
  },
  {
    keywords: ['eye pain', 'vision loss', 'blurred vision', 'eye injury'],
    condition: 'Ophthalmological Emergency',
    urgency: 'Medium',
    careType: 'General Hospital',
    description: 'Eye problems should be evaluated promptly to prevent permanent damage.',
  },
];

/**
 * Rule-based symptom analysis (fallback).
 */
function analyzeWithRules(symptomsText) {
  const input = symptomsText.toLowerCase().trim();

  if (!input) {
    return {
      condition: 'Insufficient Information',
      urgency: 'Low',
      careType: 'Clinic',
      description: 'Please provide more details about your symptoms for a better assessment.',
      method: 'rule-based',
    };
  }

  // Score each rule by how many keywords match
  const scored = symptomRules.map(rule => {
    const matchCount = rule.keywords.filter(kw => input.includes(kw)).length;
    // Give priority bonus to Emergency conditions
    const priorityBonus = rule.urgency === 'Emergency' ? 2 : rule.urgency === 'Medium' ? 1 : 0;
    return { ...rule, score: matchCount > 0 ? matchCount + priorityBonus : 0 };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  const bestMatch = scored[0];

  if (bestMatch.score === 0) {
    return {
      condition: 'Unidentified Symptoms',
      urgency: 'Medium',
      careType: 'General Hospital',
      description: 'We could not identify your symptoms precisely. We recommend visiting a general hospital for a proper evaluation.',
      method: 'rule-based',
    };
  }

  return {
    condition: bestMatch.condition,
    urgency: bestMatch.urgency,
    careType: bestMatch.careType,
    description: bestMatch.description,
    method: 'rule-based',
  };
}

// ============================================================
// OPENAI GPT ANALYZER (Primary)
// ============================================================
async function analyzeWithOpenAI(symptomsText) {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const systemPrompt = `You are a medical triage assistant for a healthcare platform called LifeLine. 
Your role is to analyze user-reported symptoms and provide an INFORMATIONAL assessment only. 
You are NOT a doctor and do NOT provide diagnoses.

IMPORTANT RULES:
1. Always include a medical disclaimer
2. Never provide a definitive diagnosis
3. When in doubt, err on the side of caution (higher urgency)
4. Be empathetic and clear

You MUST respond with ONLY valid JSON in this exact format (no markdown, no code fences):
{
  "condition": "Brief name of the possible condition (e.g., 'Possible Cardiac Event')",
  "urgency": "One of: Emergency, Medium, Low",
  "careType": "One of: Emergency Room, General Hospital, Clinic",
  "description": "A 1-2 sentence description of why this assessment was made and what the user should do"
}

Urgency guidelines:
- Emergency: Life-threatening symptoms (chest pain, difficulty breathing, stroke signs, severe bleeding, loss of consciousness, severe allergic reactions)
- Medium: Concerning symptoms that need prompt attention (high fever, moderate injuries, persistent vomiting, severe pain)
- Low: Minor symptoms that can be addressed at a clinic (common cold, mild headache, minor skin issues, mild stomach upset)`;

  const response = await client.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Analyze these symptoms: ${symptomsText}` },
    ],
    temperature: 0.3,
    max_tokens: 300,
  });

  const content = response.choices[0].message.content.trim();

  // Parse the JSON response
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    // Try to extract JSON from markdown code fences if present
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Failed to parse OpenAI response as JSON');
    }
  }

  // Validate required fields
  const validUrgencies = ['Emergency', 'Medium', 'Low'];
  const validCareTypes = ['Emergency Room', 'General Hospital', 'Clinic'];

  if (!parsed.condition || !parsed.urgency || !parsed.careType) {
    throw new Error('OpenAI response missing required fields');
  }

  // Normalize urgency and careType
  if (!validUrgencies.includes(parsed.urgency)) {
    parsed.urgency = 'Medium';
  }
  if (!validCareTypes.includes(parsed.careType)) {
    parsed.careType = 'General Hospital';
  }

  return {
    condition: parsed.condition,
    urgency: parsed.urgency,
    careType: parsed.careType,
    description: parsed.description || 'Please consult a healthcare professional for proper evaluation.',
    method: 'openai',
  };
}

// ============================================================
// MAIN ANALYZER FUNCTION
// ============================================================
async function analyzeSymptoms(symptomsText) {
  // Try OpenAI first if API key is configured
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here' && process.env.OPENAI_API_KEY.trim() !== '') {
    try {
      console.log('🤖 Using OpenAI for symptom analysis...');
      const result = await analyzeWithOpenAI(symptomsText);
      return result;
    } catch (error) {
      console.warn('⚠️ OpenAI analysis failed, falling back to rule-based:', error.message);
      // Fall through to rule-based
    }
  } else {
    console.log('📋 OpenAI API key not configured. Using rule-based analysis.');
  }

  // Fallback to rule-based analysis
  return analyzeWithRules(symptomsText);
}

module.exports = { analyzeSymptoms, analyzeWithRules, analyzeWithOpenAI };
