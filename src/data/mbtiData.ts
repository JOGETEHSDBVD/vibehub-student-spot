// MBTI / Big Five Personality Test Data (ported from Flask app)

export type Lang = "en" | "fr" | "ar";

export interface Question {
  id: number;
  trait: string;
  key: "+" | "-";
  en: string;
  fr: string;
  ar: string;
}

export const scaleLabels: Record<number, Record<Lang, string>> = {
  1: { en: "Strongly Disagree", fr: "Pas du tout d'accord", ar: "لا أوافق بشدة" },
  2: { en: "Disagree", fr: "Pas d'accord", ar: "لا أوافق" },
  3: { en: "Neutral", fr: "Neutre", ar: "محايد" },
  4: { en: "Agree", fr: "D'accord", ar: "أوافق" },
  5: { en: "Strongly Agree", fr: "Tout à fait d'accord", ar: "أوافق بشدة" },
};

export const uiText: Record<Lang, Record<string, string>> = {
  en: {
    title: "Professional Personality Assessment",
    start: "Start Assessment",
    submit: "Generate Full Report",
    restart: "Analyze New Person",
    lang_select: "Select Language",
    result_title: "Your Professional Profile",
    advice_title: "💡 AI Personal Strategy",
    next: "Next Page →",
    back: "← Previous",
  },
  fr: {
    title: "Évaluation Professionnelle",
    start: "Commencer",
    submit: "Générer le Rapport",
    restart: "Nouvelle Analyse",
    lang_select: "Choisir la langue",
    result_title: "Votre Profil Professionnel",
    advice_title: "💡 Stratégie Personnelle IA",
    next: "Suivant →",
    back: "← Retour",
  },
  ar: {
    title: "التقييم المهني للشخصية",
    start: "بدء التقييم",
    submit: "استخراج التقرير الكامل",
    restart: "تحليل شخص جديد",
    lang_select: "لغة الاختبار",
    result_title: "ملفك المهني الشخصي",
    advice_title: "💡 استراتيجية النجاح الشخصية",
    next: "← الصفحة التالية",
    back: "السابقة →",
  },
};

export const scalableTitles: Record<string, Record<Lang, string>> = {
  Extraversion: { en: "Leadership & Social Energy", fr: "Leadership & Énergie Sociale", ar: "القيادة والطاقة الاجتماعية" },
  Agreeableness: { en: "Teamwork & Empathy", fr: "Esprit d'Équipe & Empathie", ar: "روح الفريق والتعاطف" },
  Conscientiousness: { en: "Discipline & Focus", fr: "Discipline & Concentration", ar: "الانضباط والتركيز المهني" },
  Neuroticism: { en: "Stress Management", fr: "Gestion du Stress", ar: "إدارة الضغوط والمشاعر" },
  Openness: { en: "Innovation & Creativity", fr: "Innovation & Créativité", ar: "الابتكار والإبداع" },
};

export const questions: Question[] = [
  { id: 1, trait: "Extraversion", key: "+", en: "I am the life of the party.", fr: "Je mets de l'ambiance.", ar: "أنا شعلة الحفلة." },
  { id: 2, trait: "Extraversion", key: "-", en: "I don't talk a lot.", fr: "Je ne parle pas beaucoup.", ar: "أنا قليل الكلام." },
  { id: 3, trait: "Extraversion", key: "+", en: "I feel comfortable around people.", fr: "Je suis à l'aise avec les gens.", ar: "أرتاح مع الناس." },
  { id: 4, trait: "Extraversion", key: "-", en: "I keep in the background.", fr: "Je reste en retrait.", ar: "أبقى في الخلفية." },
  { id: 5, trait: "Extraversion", key: "+", en: "I start conversations.", fr: "J'engage la conversation.", ar: "أبدأ الحديث." },
  { id: 6, trait: "Extraversion", key: "-", en: "I have little to say.", fr: "J'ai peu de choses à dire.", ar: "ليس لدي الكثير لأقوله." },
  { id: 7, trait: "Extraversion", key: "+", en: "I talk to a lot of different people at parties.", fr: "Je parle à beaucoup de gens.", ar: "أتحدث مع الكثير من الناس." },
  { id: 8, trait: "Extraversion", key: "-", en: "I don't like to draw attention to myself.", fr: "Je n'aime pas attirer l'attention.", ar: "لا أحب لفت الانتباه." },
  { id: 9, trait: "Extraversion", key: "+", en: "I don't mind being the center of attention.", fr: "J'aime être le centre de l'attention.", ar: "لا أمانع أن أكون محط الأنظار." },
  { id: 10, trait: "Extraversion", key: "-", en: "I am quiet around strangers.", fr: "Je suis calme avec les inconnus.", ar: "أكون هادئاً مع الغرباء." },
  { id: 11, trait: "Agreeableness", key: "+", en: "I am interested in people.", fr: "Je m'intéresse aux gens.", ar: "أهتم بالناس." },
  { id: 12, trait: "Agreeableness", key: "-", en: "I insult people.", fr: "J'insulte les gens.", ar: "أهين الناس أحياناً." },
  { id: 13, trait: "Agreeableness", key: "+", en: "I sympathize with others.", fr: "Je sympathise avec les autres.", ar: "أتعاطف مع الآخرين." },
  { id: 14, trait: "Agreeableness", key: "-", en: "I am not interested in other people's problems.", fr: "Je ne m'intéresse pas aux autres.", ar: "لا أهتم بمشاكل الغير." },
  { id: 15, trait: "Agreeableness", key: "+", en: "I have a soft heart.", fr: "J'ai le cœur tendre.", ar: "قلبي رقيق." },
  { id: 16, trait: "Agreeableness", key: "-", en: "I feel little concern for others.", fr: "Je me soucie peu des autres.", ar: "لا أشعر بقلق تجاه الآخرين." },
  { id: 17, trait: "Agreeableness", key: "+", en: "I take time out for others.", fr: "Je prends du temps pour les autres.", ar: "أخصص وقتاً للآخرين." },
  { id: 18, trait: "Agreeableness", key: "-", en: "I am not really interested in others.", fr: "Je ne m'intéresse pas vraiment aux autres.", ar: "لست مهتماً حقاً بالآخرين." },
  { id: 19, trait: "Agreeableness", key: "+", en: "I feel others' emotions.", fr: "Je ressens les émotions des autres.", ar: "أشعر بمشاعر الآخرين." },
  { id: 20, trait: "Agreeableness", key: "-", en: "I make people feel at ease.", fr: "Je mets les gens à l'aise.", ar: "أجعل الناس يشعرون بالراحة." },
  { id: 21, trait: "Conscientiousness", key: "+", en: "I am always prepared.", fr: "Je suis toujours prêt.", ar: "أنا مستعد دائماً." },
  { id: 22, trait: "Conscientiousness", key: "-", en: "I leave my belongings around.", fr: "Je laisse traîner mes affaires.", ar: "أترك أغراضي مبعثرة." },
  { id: 23, trait: "Conscientiousness", key: "+", en: "I pay attention to details.", fr: "Je fais attention aux détails.", ar: "أهتم بالتفاصيل." },
  { id: 24, trait: "Conscientiousness", key: "-", en: "I make a mess of things.", fr: "Je fais du désordre.", ar: "أحدث فوضى." },
  { id: 25, trait: "Conscientiousness", key: "+", en: "I get chores done right away.", fr: "Je fais mes corvées tout de suite.", ar: "أنجز مهامي فوراً." },
  { id: 26, trait: "Conscientiousness", key: "-", en: "I often forget to put things back.", fr: "J'oublie de ranger.", ar: "أنسى إعادة الأشياء لمكانها." },
  { id: 27, trait: "Conscientiousness", key: "+", en: "I like order.", fr: "J'aime l'ordre.", ar: "أحب النظام." },
  { id: 28, trait: "Conscientiousness", key: "-", en: "I shirk my duties.", fr: "Je fuis mes devoirs.", ar: "أتهرب من واجباتي." },
  { id: 29, trait: "Conscientiousness", key: "+", en: "I follow a schedule.", fr: "Je suis un planning.", ar: "أتبع جدولاً زمنياً." },
  { id: 30, trait: "Conscientiousness", key: "-", en: "I neglect my duties.", fr: "Je néglige mes devoirs.", ar: "أهمل واجباتي." },
  { id: 31, trait: "Neuroticism", key: "+", en: "I get stressed easily.", fr: "Je stresse facilement.", ar: "أتوتر بسهولة." },
  { id: 32, trait: "Neuroticism", key: "-", en: "I am relaxed most of the time.", fr: "Je suis détendu.", ar: "أنا مسترخٍ غالباً." },
  { id: 33, trait: "Neuroticism", key: "+", en: "I worry about things.", fr: "Je m'inquiète.", ar: "أقلق كثيراً." },
  { id: 34, trait: "Neuroticism", key: "-", en: "I seldom feel blue.", fr: "Je me sens rarement triste.", ar: "نادراً ما أحزن." },
  { id: 35, trait: "Neuroticism", key: "+", en: "I am easily disturbed.", fr: "Je suis facilement perturbé.", ar: "أنزعج بسهولة." },
  { id: 36, trait: "Neuroticism", key: "+", en: "I get upset easily.", fr: "Je me fâche facilement.", ar: "أغضب بسرعة." },
  { id: 37, trait: "Neuroticism", key: "+", en: "I change my mood a lot.", fr: "Je change souvent d'humeur.", ar: "مزاجي يتقلب كثيراً." },
  { id: 38, trait: "Neuroticism", key: "+", en: "I have frequent mood swings.", fr: "J'ai des sautes d'humeur.", ar: "لدي تقلبات مزاجية." },
  { id: 39, trait: "Neuroticism", key: "+", en: "I get irritated easily.", fr: "Je m'irrite facilement.", ar: "أشعر بالاستفزاز بسرعة." },
  { id: 40, trait: "Neuroticism", key: "+", en: "I often feel blue.", fr: "Je déprime souvent.", ar: "أشعر بالحزن غالباً." },
  { id: 41, trait: "Openness", key: "+", en: "I have a rich vocabulary.", fr: "J'ai un vocabulaire riche.", ar: "مفرداتي غنية." },
  { id: 42, trait: "Openness", key: "-", en: "I have difficulty understanding abstract ideas.", fr: "J'ai du mal avec l'abstrait.", ar: "أجد صعوبة في التجريد." },
  { id: 43, trait: "Openness", key: "+", en: "I have a vivid imagination.", fr: "J'ai de l'imagination.", ar: "خيالي واسع." },
  { id: 44, trait: "Openness", key: "-", en: "I am not interested in abstract ideas.", fr: "Je ne m'intéresse pas à l'abstrait.", ar: "لا أهتم بالنظريات." },
  { id: 45, trait: "Openness", key: "+", en: "I have excellent ideas.", fr: "J'ai d'excellentes idées.", ar: "لدي أفكار ممتازة." },
  { id: 46, trait: "Openness", key: "-", en: "I do not have a good imagination.", fr: "Je n'ai pas d'imagination.", ar: "ليس لدي خيال واسع." },
  { id: 47, trait: "Openness", key: "+", en: "I am quick to understand things.", fr: "Je comprends vite.", ar: "أفهم الأمور بسرعة." },
  { id: 48, trait: "Openness", key: "+", en: "I use difficult words.", fr: "J'utilise des mots difficiles.", ar: "أستخدم كلمات صعبة." },
  { id: 49, trait: "Openness", key: "+", en: "I spend time reflecting on things.", fr: "Je réfléchis beaucoup.", ar: "أتأمل وأفكر بعمق." },
  { id: 50, trait: "Openness", key: "+", en: "I am full of ideas.", fr: "Je déborde d'idées.", ar: "عقلي مليء بالأفكار." },
];

export const resultsText: Record<string, Record<string, Record<Lang, string>>> = {
  Extraversion: {
    high: { en: "The Natural Commander", fr: "Le Commandant Naturel", ar: "القائد الطبيعي" },
    low: { en: "The Deep Observer", fr: "L'Observateur Profond", ar: "المراقب العميق" },
    medium: { en: "The Adaptive Diplomat", fr: "Le Diplomate Adaptable", ar: "الدبلوماسي المرن" },
  },
  Agreeableness: {
    high: { en: "The Peacekeeper", fr: "Le Pacificateur", ar: "صانع السلام" },
    low: { en: "The Analytical Thinker", fr: "Le Penseur Analytique", ar: "المفكر التحليلي" },
    medium: { en: "The Balanced Negotiator", fr: "Le Négociateur Équilibré", ar: "المفاوض المتوازن" },
  },
  Conscientiousness: {
    high: { en: "The Master of Focus", fr: "Le Maître de la Concentration", ar: "سيد التركيز" },
    low: { en: "The Spontaneous Creator", fr: "Le Créateur Spontané", ar: "المبدع العفوي" },
    medium: { en: "The Flexible Planner", fr: "Le Planificateur Flexible", ar: "المخطط المرن" },
  },
  Neuroticism: {
    high: { en: "The Highly Sensitive", fr: "Le Sensible", ar: "الحساس جداً" },
    low: { en: "The Unshakable Rock", fr: "Le Roc Inébranlable", ar: "الصخرة الثابتة" },
    medium: { en: "The Responsive Realist", fr: "Le Réaliste Réactif", ar: "الواقعي المتفاعل" },
  },
  Openness: {
    high: { en: "The Visionary Innovator", fr: "L'Innovateur Visionnaire", ar: "المبتكر صاحب الرؤية" },
    low: { en: "The Practical Traditionalist", fr: "Le Traditionaliste Pratique", ar: "التقليدي العملي" },
    medium: { en: "The Grounded Explorer", fr: "L'Explorateur Ancré", ar: "المستكشف الواقعي" },
  },
};

export const traitDefinitions: Record<string, Record<string, Record<Lang, string>>> = {
  Extraversion: {
    high: { en: "You thrive on social energy. You speak up, take initiative, and naturally fill the room. Meetings, negotiations, and team rallying are your native terrain.", fr: "Vous êtes dynamisé par les interactions sociales.", ar: "دماغك يستجيب بقوة للمكافآت الاجتماعية. أنت تفكر بصوت عالٍ وتستمد طاقتك من الناس." },
    medium: { en: "You balance curiosity with practicality. You are open to new ideas when they are grounded in evidence and applicable to real situations.", fr: "Vous passez facilement du social au calme.", ar: "أنت متوازن. جهازك العصبي مرن." },
    low: { en: "You process information internally. Social noise drains your battery quickly.", fr: "Vous préférez la solitude et les conversations profondes.", ar: "جهازك العصبي حساس للمحفزات الخارجية." },
  },
  Agreeableness: {
    high: { en: "You prioritize group harmony and are wired for empathy.", fr: "Vous faites passer les autres avant vous.", ar: "دماغك يفرز هرمون الأوكسيتوسين بكثرة." },
    medium: { en: "You balance empathy with pragmatism. You know when to be the peacemaker and when to hold firm. This makes you a skilled negotiator.", fr: "Vous êtes poli mais ferme.", ar: "لديك توازن بين التعاطف والمنطق." },
    low: { en: "You prioritize logic, facts, and efficiency over feelings.", fr: "Vous privilégiez la logique aux sentiments.", ar: "تفكيرك تحليلي بحت." },
  },
  Conscientiousness: {
    high: { en: "Your executive function is strong. You naturally organize and plan ahead.", fr: "Vous êtes organisé et discipliné.", ar: "الفص الجبهي في دماغك نشط جداً." },
    medium: { en: "You plan when it matters and improvise when it doesn't. You are neither a rigid planner nor a pure improviser — you read the context.", fr: "Vous avez un bon équilibre travail-flexibilité.", ar: "لديك مرونة ذهنية." },
    low: { en: "You are spontaneous and prefer flexibility over rigid structures.", fr: "Vous préférez la spontanéité.", ar: "أنت عفوي وتعيش اللحظة." },
  },
  Neuroticism: {
    high: { en: "Your threat detection system is sensitive. You feel emotions deeply.", fr: "Vous vivez les émotions intensément.", ar: "نظام إنذار الخطر في دماغك حساس." },
    medium: { en: "You feel emotions proportionally. You process stress without being consumed by it and recover from setbacks with reasonable speed.", fr: "Vous gérez bien le stress en général.", ar: "جهازك العصبي مستقر في الظروف العادية." },
    low: { en: "You are emotionally stable and resilient. Stress rolls off you.", fr: "Vous êtes calme et posé.", ar: "أعصابك باردة جداً." },
  },
  Openness: {
    high: { en: "You have divergent thinking. You connect unrelated ideas easily.", fr: "Vous avez une imagination débordante.", ar: "عقلك يعمل بطريقة التفكير التشعبي." },
    medium: { en: "You combine imagination with grounding — you can brainstorm wild ideas and then ask 'but does this actually work?' This makes you the ideal innovation filter.", fr: "Vous appréciez l'innovation et la tradition.", ar: "أنت تقدر الأفكار الجديدة، لكنك لا تنجرف وراء الخيال." },
    low: { en: "You are concrete and practical. You trust what is proven.", fr: "Vous êtes pragmatique et réaliste.", ar: "تفكيرك واقعي وملموس." },
  },
};

export const adviceDb: Record<string, any> = {
  Extraversion: {
    high: {
      en: "Your social energy is your superpower. Lead meetings with intention, mentor quieter colleagues, and remember that your visibility creates responsibility. The best leaders know when to speak and when to listen.",
      fr: "Votre énergie sociale est votre superpower. Utilisez votre charisme, mais évitez la domination sensorielle.",
      ar: "طاقتك الاجتماعية هي قوتك الخارقة. استغل جاذبيتك الفطرية في القيادة.",
    },
    medium: {
      en: "You read rooms perfectly. Use this social intelligence to become the person everyone trusts to mediate disputes, align stakeholders, and build consensus without losing momentum.",
      fr: "Vous possédez une haute neuroplasticité sociale. Agissez comme l'ancre psychologique de votre équipe.",
      ar: "أنت تمتلك مرونة عصبية واجتماعية عالية.",
    },
    low: {
      en: "Your depth of thought is your edge. Structure your work around deep focus sessions and written communication. Your best ideas come from quiet reflection, not brainstorm chaos.",
      fr: "Arrêtez de forcer l'extraversion. Capitalisez sur le Leadership Asynchrone.",
      ar: "تعتمد قشرتك الجبهية على المعالجة المعرفية العميقة.",
    },
  },
  Agreeableness: {
    high: {
      en: "Your empathy is rare and valuable. Protect it by setting boundaries — you can't pour from an empty cup. Channel your care into mentoring roles where your emotional intelligence creates lasting impact.",
      fr: "Construisez des Pare-feux Cognitifs et imposez des limites strictes.",
      ar: "لديك هيمنة لهرمون الأوكسيتوسين.",
    },
    medium: {
      en: "You balance warmth with objectivity — a rare combination. Use it to bridge gaps between emotional teammates and analytical ones. You're the translator every team needs.",
      fr: "Utilisez votre base objective pour arbitrer les conflits.",
      ar: "أنت توازن بين الرنين العاطفي والمنطق البراغماتي.",
    },
    low: {
      en: "Your analytical clarity cuts through noise. Frame feedback with data ('The metrics show...') rather than personal critique to keep teams receptive to your insights.",
      fr: "Employez le cadre d'Empathie Tactique.",
      ar: "محركك التحليلي يحيد العواطف تماماً لصالح الكفاءة.",
    },
  },
  Conscientiousness: {
    high: {
      en: "You are the flexible executor — you know when to use a system and when to throw the playbook out. This is rare and valuable. Position yourself in roles that require both strategic thinking and tactical agility.",
      fr: "Mettez en œuvre la règle des 80/20.",
      ar: "الوظائف التنفيذية في قشرتك الجبهية محسنة للحد الأقصى.",
    },
    medium: {
      en: "You plan when it matters and improvise when it doesn't. Use time-boxing (45-min focused sprints) to maximize your natural rhythm without burning out.",
      fr: "Maximisez le rendement grâce au Time-Boxing.",
      ar: "تمتلك ديناميكية تنفيذية مرنة.",
    },
    low: {
      en: "Your spontaneity is creative fuel, but pair it with external systems — calendars, reminders, accountability partners — to turn ideas into finished work.",
      fr: "Externalisez votre fonction exécutive.",
      ar: "أنت تعتمد على نهج تنفيذي متشعب وغير خطي.",
    },
  },
  Neuroticism: {
    high: {
      en: "Your sensitivity is a superpower when managed. Journal your anxieties to move them from emotion to logic. Physical exercise and breathing techniques are your daily maintenance protocol.",
      fr: "La gestion du cortisol est obligatoire.",
      ar: "اللوزة الدماغية لديك في حالة يقظة مفرطة.",
    },
    medium: {
      en: "You process pressure without drowning in it. This emotional regulation is what most people spend years developing. Use it as a competitive advantage in high-pressure environments.",
      fr: "Utilisez le Soupir Physiologique pour ralentir votre rythme cardiaque.",
      ar: "يحافظ جهازك العصبي على التوازن غالباً.",
    },
    low: {
      en: "Your calm under fire is invaluable. Just remember to verbally acknowledge stress in your team — your composure can be mistaken for indifference if you don't.",
      fr: "Verbalisez la gravité des situations.",
      ar: "تمتلك استقراراً حوفياً استثنائياً.",
    },
  },
  Openness: {
    high: {
      en: "You're an idea machine. Your challenge isn't generating — it's finishing. Pick your top idea, commit to shipping it, and save the rest in a 'future ideas' doc. Execution beats imagination.",
      fr: "Vous êtes l'Architecte, pas le Maçon.",
      ar: "يعمل دماغك بنظام التفكير التشعبي.",
    },
    medium: {
      en: "You combine imagination with grounding — you can brainstorm wild ideas and then ask 'but does this actually work?' This makes you the ideal innovation filter: keeping teams from both stagnation and fantasy.",
      fr: "Traduisez les concepts abstraits en modèles empiriques.",
      ar: "أنت الفلتر البراغماتي الحيوي.",
    },
    low: {
      en: "Your grounding in reality is an asset. When presented with new ideas, ask for a small proof-of-concept before committing. You protect teams from chasing shiny objects.",
      fr: "Exigez des Micro-Pilotes.",
      ar: "أنت تعتمد على المعالجة المعرفية الخوارزمية.",
    },
  },

  // Archetypes
  Mad_Scientist: {
    en: "🧪 Archetype: The Mad Scientist. High divergent thinking coupled with severe executive dysfunction. You generate paradigm-shifting ideas but lack the scaffolding to execute them. Find a highly conscientious partner to anchor your chaos into reality.",
    fr: "🧪 Archétype: Le Savant Fou. Trouvez un partenaire pour ancrer votre chaos dans la réalité.",
    ar: "🧪 النمط: العالم المجنون. ابحث عن شريك عالي الانضباط.",
  },
  Micromanager: {
    en: "📋 Archetype: The Algorithmic Dictator. Extreme structural dependence with low cognitive adaptability. Shift focus from granular control to macro-level outcome metrics.",
    fr: "📋 Archétype: Le Dictateur Algorithmique.",
    ar: "📋 النمط: الديكتاتور الخوارزمي.",
  },
  Bulldozer: {
    en: "🚜 Archetype: The Kinetic Commander. High external drive completely unfiltered by empathic resonance. Allocate 15% of your bandwidth to acknowledging others' emotional states.",
    fr: "🚜 Archétype: Le Commandeur Cinétique.",
    ar: "🚜 النمط: القائد الكينتيكي.",
  },
  Invisible_Saint: {
    en: "🕊️ Archetype: The Sacrificial Anchor. Pathological empathy combined with low assertiveness. Self-advocacy is now mandatory.",
    fr: "🕊️ Archétype: L'Ancre Sacrificielle.",
    ar: "🕊️ النمط: المرساة المضحية.",
  },
  Anxious_Achiever: {
    en: "⚡ Archetype: The Cortisol Engine. Your extreme executive functioning is powered by the terror of failure. Disconnect your self-worth from your output.",
    fr: "⚡ Archétype: Le Moteur à Cortisol.",
    ar: "⚡ النمط: محرك الكورتيزول.",
  },
  Ice_Logician: {
    en: "🧊 Archetype: The Empirical Architect. Zero emotional volatility paired with zero limbic resonance. Learn to simulate baseline emotional warmth.",
    fr: "🧊 Archétype: L'Architecte Empirique.",
    ar: "🧊 النمط: المهندس التجريبي.",
  },
  Social_Butterfly: {
    en: "🦋 Archetype: The Dopamine Catalyst. High conceptual neuroplasticity combined with massive social drive. You inspire everyone but complete nothing. Lock yourself in a room until phase one is done.",
    fr: "🦋 Archétype: Le Catalyseur de Dopamine.",
    ar: "🦋 النمط: محفز الدوبامين.",
  },
  Guardian: {
    en: "🛡️ Archetype: The Systemic Shield. High empathic awareness focused on protecting legacy systems. Understand that controlled innovation prevents systemic decay.",
    fr: "🛡️ Archétype: Le Bouclier Systémique.",
    ar: "🛡️ النمط: الدرع الهيكلي.",
  },
  Volatile_Artist: {
    en: "🎨 Archetype: The Neuro-Divergent Creator. Extreme abstract capacity chained to a highly reactive amygdala. Use structural rigidity to contain your limbic chaos.",
    fr: "🎨 Archétype: Le Créateur Neuro-Divergent.",
    ar: "🎨 النمط: المبدع العصبي المتشعب.",
  },
  Lone_Wolf: {
    en: "🐺 Archetype: The Autonomous Operator. Zero reliance on external social validation. Optimize for asymmetric, solo deep-work.",
    fr: "🐺 Archétype: L'Opérateur Autonome.",
    ar: "🐺 النمط: المشغل الذاتي.",
  },
};

export interface Combo {
  name: string;
  cond: (s: Record<string, number>) => boolean;
}

export const combos: Combo[] = [
  { name: "Mad_Scientist", cond: (s) => s.Openness > 60 && s.Conscientiousness < 40 },
  { name: "Micromanager", cond: (s) => s.Conscientiousness > 70 && s.Openness < 30 },
  { name: "Bulldozer", cond: (s) => s.Extraversion > 70 && s.Agreeableness < 30 },
  { name: "Invisible_Saint", cond: (s) => s.Agreeableness > 70 && s.Extraversion < 30 },
  { name: "Anxious_Achiever", cond: (s) => s.Conscientiousness > 70 && s.Neuroticism > 70 },
  { name: "Ice_Logician", cond: (s) => s.Agreeableness < 30 && s.Neuroticism < 30 },
  { name: "Social_Butterfly", cond: (s) => s.Extraversion > 70 && s.Openness > 60 },
  { name: "Guardian", cond: (s) => s.Openness < 40 && s.Agreeableness > 60 },
  { name: "Volatile_Artist", cond: (s) => s.Openness > 70 && s.Neuroticism > 70 },
  { name: "Lone_Wolf", cond: (s) => s.Extraversion < 30 && s.Agreeableness < 40 },
];

export interface Conflict {
  name: string;
  cond: (s: Record<string, number>) => boolean;
  text: Record<Lang, string>;
}

export const conflicts: Conflict[] = [
  {
    name: "The Paralyzed Visionary",
    cond: (s) => s.Openness > 70 && s.Neuroticism > 70,
    text: {
      en: "You have a war between your Vision (High Openness) and your Fear (High Neuroticism). You dream of massive projects, but as soon as you start, your brain floods with 'What if I fail?' scenarios, causing you to freeze.",
      fr: "Guerre entre Vision et Peur. Vous rêvez grand, mais la peur de l'échec vous paralyse.",
      ar: "لديك حرب داخلية بين خيالك الواسع وبين خوفك. أنت تحلم بمشاريع ضخمة، لكن بمجرد أن تبدأ، يغرق عقلك في سيناريوهات 'ماذا لو فشلت؟'.",
    },
  },
  {
    name: "The Lonely Captain",
    cond: (s) => s.Extraversion > 70 && s.Agreeableness < 30,
    text: {
      en: "You have a conflict between Leadership (High Extraversion) and Connection (Low Agreeableness). You easily attract people with your charisma, but you push them away with your cold logic.",
      fr: "Conflit entre Leadership et Connexion. Vous attirez les gens mais les repoussez avec votre froideur.",
      ar: "تناقض بين القيادة والتعاطف. أنت تجذب الناس بجاذبيتك بسهولة، لكنك تبعدهم عنك ببرودك.",
    },
  },
  {
    name: "The Chaotic Perfectionist",
    cond: (s) => s.Conscientiousness > 70 && s.Openness > 70,
    text: {
      en: "Your Creativity (High Openness) wants to explore everywhere, but your Discipline (High Conscientiousness) demands a strict plan. You likely start 10 organized projects and finish none.",
      fr: "Votre Créativité veut tout explorer, mais votre Discipline veut un plan. Vous commencez 10 projets sans les finir.",
      ar: "إبداعك يريد استكشاف كل شيء، لكن انضباطك يطالب بخطة صارمة.",
    },
  },
  {
    name: "The People-Pleaser's Burnout",
    cond: (s) => s.Agreeableness > 75 && s.Neuroticism > 60,
    text: {
      en: "Your High Empathy makes you say 'Yes' to everyone, but your High Anxiety makes you panic about the workload. You are likely exhausted because you are carrying other people's emotional baggage.",
      fr: "Votre Empathie dit 'Oui', votre Anxiété panique. Vous êtes épuisé par le fardeau émotionnel des autres.",
      ar: "تعاطفك العالي يجعلك تقول 'نعم' للجميع، لكن قلقك العالي يجعلك تنهار تحت ضغط العمل.",
    },
  },
];

// Scoring engine
export const TRAITS_ORDER = ["Extraversion", "Agreeableness", "Conscientiousness", "Neuroticism", "Openness"] as const;

export function calculateScores(answers: Record<number, number>): Record<string, number> {
  const scores: Record<string, number> = {};
  const counts: Record<string, number> = {};

  for (const trait of TRAITS_ORDER) {
    scores[trait] = 0;
    counts[trait] = 0;
  }

  for (const [qIdStr, value] of Object.entries(answers)) {
    const qId = parseInt(qIdStr);
    const question = questions.find((q) => q.id === qId);
    if (!question) continue;
    const score = question.key === "-" ? 6 - value : value;
    scores[question.trait] += score;
    counts[question.trait] += 1;
  }

  const finalScores: Record<string, number> = {};
  for (const trait of TRAITS_ORDER) {
    finalScores[trait] = counts[trait] > 0 ? Math.round((scores[trait] / (counts[trait] * 5)) * 100) : 0;
  }
  return finalScores;
}

export function getLevel(score: number): "high" | "medium" | "low" {
  if (score >= 66) return "high";
  if (score <= 33) return "low";
  return "medium";
}

export function getDnaCode(scores: Record<string, number>): string {
  return TRAITS_ORDER.map((t) => getLevel(scores[t])[0].toUpperCase()).join("-");
}

export function getRarity(scores: Record<string, number>): { title: string; color: string } {
  const totalDeviation = Object.values(scores).reduce((sum, s) => sum + Math.abs(s - 50), 0);
  if (totalDeviation > 150) return { title: "🦄 Mythic Rare (Top 0.1%)", color: "#7C3AED" };
  if (totalDeviation > 100) return { title: "💎 Ultra Rare (Top 5%)", color: "#2563EB" };
  if (totalDeviation > 60) return { title: "✨ Rare (Top 15%)", color: "#059669" };
  return { title: "👤 Common (Balanced)", color: "#6B7280" };
}
