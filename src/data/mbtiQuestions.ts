export interface MBTIQuestion {
  id: number;
  trait: string;
  key: "+" | "-";
  text: string;
}

export const questions: MBTIQuestion[] = [
  { id: 1, trait: "Extraversion", key: "+", text: "Je mets de l'ambiance." },
  { id: 2, trait: "Extraversion", key: "-", text: "Je ne parle pas beaucoup." },
  { id: 3, trait: "Extraversion", key: "+", text: "Je suis à l'aise avec les gens." },
  { id: 4, trait: "Extraversion", key: "-", text: "Je reste en retrait." },
  { id: 5, trait: "Extraversion", key: "+", text: "J'engage la conversation." },
  { id: 6, trait: "Extraversion", key: "-", text: "J'ai peu de choses à dire." },
  { id: 7, trait: "Extraversion", key: "+", text: "Je parle à beaucoup de gens." },
  { id: 8, trait: "Extraversion", key: "-", text: "Je n'aime pas attirer l'attention." },
  { id: 9, trait: "Extraversion", key: "+", text: "J'aime être le centre de l'attention." },
  { id: 10, trait: "Extraversion", key: "-", text: "Je suis calme avec les inconnus." },
  { id: 11, trait: "Agreeableness", key: "+", text: "Je m'intéresse aux gens." },
  { id: 12, trait: "Agreeableness", key: "-", text: "J'insulte les gens." },
  { id: 13, trait: "Agreeableness", key: "+", text: "Je sympathise avec les autres." },
  { id: 14, trait: "Agreeableness", key: "-", text: "Je ne m'intéresse pas aux autres." },
  { id: 15, trait: "Agreeableness", key: "+", text: "J'ai le cœur tendre." },
  { id: 16, trait: "Agreeableness", key: "-", text: "Je me soucie peu des autres." },
  { id: 17, trait: "Agreeableness", key: "+", text: "Je prends du temps pour les autres." },
  { id: 18, trait: "Agreeableness", key: "-", text: "Je ne m'intéresse pas vraiment aux autres." },
  { id: 19, trait: "Agreeableness", key: "+", text: "Je ressens les émotions des autres." },
  { id: 20, trait: "Agreeableness", key: "-", text: "Je mets les gens à l'aise." },
  { id: 21, trait: "Conscientiousness", key: "+", text: "Je suis toujours prêt." },
  { id: 22, trait: "Conscientiousness", key: "-", text: "Je laisse traîner mes affaires." },
  { id: 23, trait: "Conscientiousness", key: "+", text: "Je fais attention aux détails." },
  { id: 24, trait: "Conscientiousness", key: "-", text: "Je fais du désordre." },
  { id: 25, trait: "Conscientiousness", key: "+", text: "Je fais mes corvées tout de suite." },
  { id: 26, trait: "Conscientiousness", key: "-", text: "J'oublie de ranger." },
  { id: 27, trait: "Conscientiousness", key: "+", text: "J'aime l'ordre." },
  { id: 28, trait: "Conscientiousness", key: "-", text: "Je fuis mes devoirs." },
  { id: 29, trait: "Conscientiousness", key: "+", text: "Je suis un planning." },
  { id: 30, trait: "Conscientiousness", key: "-", text: "Je néglige mes devoirs." },
  { id: 31, trait: "Neuroticism", key: "+", text: "Je stresse facilement." },
  { id: 32, trait: "Neuroticism", key: "-", text: "Je suis détendu." },
  { id: 33, trait: "Neuroticism", key: "+", text: "Je m'inquiète." },
  { id: 34, trait: "Neuroticism", key: "-", text: "Je me sens rarement triste." },
  { id: 35, trait: "Neuroticism", key: "+", text: "Je suis facilement perturbé." },
  { id: 36, trait: "Neuroticism", key: "+", text: "Je me fâche facilement." },
  { id: 37, trait: "Neuroticism", key: "+", text: "Je change souvent d'humeur." },
  { id: 38, trait: "Neuroticism", key: "+", text: "J'ai des sautes d'humeur." },
  { id: 39, trait: "Neuroticism", key: "+", text: "Je m'irrite facilement." },
  { id: 40, trait: "Neuroticism", key: "+", text: "Je déprime souvent." },
  { id: 41, trait: "Openness", key: "+", text: "J'ai un vocabulaire riche." },
  { id: 42, trait: "Openness", key: "-", text: "J'ai du mal avec l'abstrait." },
  { id: 43, trait: "Openness", key: "+", text: "J'ai de l'imagination." },
  { id: 44, trait: "Openness", key: "-", text: "Je ne m'intéresse pas à l'abstrait." },
  { id: 45, trait: "Openness", key: "+", text: "J'ai d'excellentes idées." },
  { id: 46, trait: "Openness", key: "-", text: "Je manque d'imagination." },
  { id: 47, trait: "Openness", key: "+", text: "Je comprends vite." },
  { id: 48, trait: "Openness", key: "-", text: "J'utilise des mots compliqués." },
  { id: 49, trait: "Openness", key: "+", text: "Je suis plein d'idées." },
  { id: 50, trait: "Openness", key: "-", text: "Je ne suis pas intéressé par l'abstrait." },
];

export const scaleLabels = [
  { value: 1, label: "Pas du tout d'accord" },
  { value: 2, label: "Pas d'accord" },
  { value: 3, label: "Neutre" },
  { value: 4, label: "D'accord" },
  { value: 5, label: "Tout à fait d'accord" },
];

export const traitLabels: Record<string, string> = {
  Extraversion: "Leadership & Énergie Sociale",
  Agreeableness: "Esprit d'Équipe & Empathie",
  Conscientiousness: "Discipline & Concentration",
  Neuroticism: "Gestion du Stress",
  Openness: "Innovation & Créativité",
};

export const QUESTIONS_PER_PAGE = 5;
export const TOTAL_PAGES = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
