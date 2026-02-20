/**
 * Story generation script.
 * Usage: npx tsx scripts/generate-stories.ts
 *
 * Requires ANTHROPIC_API_KEY in environment.
 * Resumes automatically if interrupted — skips slugs that already have a file.
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

const STORIES_DIR = path.join(process.cwd(), 'src/data/stories');
const META_PATH = path.join(process.cwd(), 'src/data/stories-meta.json');
const CONCURRENCY = 5; // parallel API calls

type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
type StoryCategory = 'news' | 'story' | 'poem' | 'blog' | 'journal' | 'science' | 'culture';

interface TopicSpec {
  level: CEFRLevel;
  category: StoryCategory;
  topic: string;
}

// ─── 480 diverse topic specs ──────────────────────────────────────────────────

const TOPICS: TopicSpec[] = [
  // ── A1: News (15) ──
  { level: 'A1', category: 'news', topic: 'A new bakery opens in a small German town' },
  { level: 'A1', category: 'news', topic: 'A dog becomes the mascot of a local football team' },
  { level: 'A1', category: 'news', topic: 'A city gives free bus tickets to children' },
  { level: 'A1', category: 'news', topic: 'A zoo welcomes baby penguins' },
  { level: 'A1', category: 'news', topic: 'A library opens on Sundays for the first time' },
  { level: 'A1', category: 'news', topic: 'A school plants a vegetable garden' },
  { level: 'A1', category: 'news', topic: 'A cat is found after three weeks missing' },
  { level: 'A1', category: 'news', topic: 'Children clean up a park in Hamburg' },
  { level: 'A1', category: 'news', topic: 'A new playground opens in a Vienna neighbourhood' },
  { level: 'A1', category: 'news', topic: 'A market sells fresh fruit every Saturday' },
  { level: 'A1', category: 'news', topic: 'A small town gets a new swimming pool' },
  { level: 'A1', category: 'news', topic: 'A farmer saves a duck family from a road' },
  { level: 'A1', category: 'news', topic: 'A village celebrates its 500th birthday' },
  { level: 'A1', category: 'news', topic: 'A school gives every child a book for free' },
  { level: 'A1', category: 'news', topic: 'Neighbours build a community garden together' },

  // ── A1: Story (35) ──
  { level: 'A1', category: 'story', topic: 'A child bakes a birthday cake for their mother' },
  { level: 'A1', category: 'story', topic: 'Two friends play football in the rain' },
  { level: 'A1', category: 'story', topic: 'A girl learns to ride a bicycle' },
  { level: 'A1', category: 'story', topic: 'A boy adopts a stray cat' },
  { level: 'A1', category: 'story', topic: 'A family goes shopping at the supermarket' },
  { level: 'A1', category: 'story', topic: 'A child visits their grandparents in the countryside' },
  { level: 'A1', category: 'story', topic: 'A dog learns a new trick' },
  { level: 'A1', category: 'story', topic: 'A family has breakfast on a Sunday morning' },
  { level: 'A1', category: 'story', topic: 'A child loses their umbrella and gets wet' },
  { level: 'A1', category: 'story', topic: 'A boy gets lost at the train station' },
  { level: 'A1', category: 'story', topic: 'A girl writes her first letter to a pen pal' },
  { level: 'A1', category: 'story', topic: 'A class goes on a trip to the zoo' },
  { level: 'A1', category: 'story', topic: 'A child wakes up late and misses the school bus' },
  { level: 'A1', category: 'story', topic: 'Two sisters share a bedroom and argue about tidiness' },
  { level: 'A1', category: 'story', topic: 'A boy cooks soup for the first time' },
  { level: 'A1', category: 'story', topic: 'A girl finds a coin on the street' },
  { level: 'A1', category: 'story', topic: 'A family watches a football match together' },
  { level: 'A1', category: 'story', topic: 'A child sees snow for the first time' },
  { level: 'A1', category: 'story', topic: 'A cat knocks a glass off the table' },
  { level: 'A1', category: 'story', topic: 'A child learns to say hello in three languages' },
  { level: 'A1', category: 'story', topic: 'A boy helps an old woman carry her groceries' },
  { level: 'A1', category: 'story', topic: 'A girl plants a sunflower seed' },
  { level: 'A1', category: 'story', topic: 'A child feeds ducks at the lake' },
  { level: 'A1', category: 'story', topic: 'A family buys a new table for the kitchen' },
  { level: 'A1', category: 'story', topic: 'A boy draws a picture of his house' },
  { level: 'A1', category: 'story', topic: 'A girl finds a bird that fell from its nest' },
  { level: 'A1', category: 'story', topic: 'A child brushes their teeth before bed' },
  { level: 'A1', category: 'story', topic: 'Two children build a snowman in the garden' },
  { level: 'A1', category: 'story', topic: 'A boy forgets his lunch at home' },
  { level: 'A1', category: 'story', topic: 'A family walks to the lake on a warm evening' },
  { level: 'A1', category: 'story', topic: 'A girl asks a shop assistant for help' },
  { level: 'A1', category: 'story', topic: 'A child helps wash the family car' },
  { level: 'A1', category: 'story', topic: 'A boy meets a new classmate' },
  { level: 'A1', category: 'story', topic: 'A girl gets a new school bag for her birthday' },
  { level: 'A1', category: 'story', topic: 'A child waters the plants while parents are away' },

  // ── A1: Poem (10) ──
  { level: 'A1', category: 'poem', topic: 'A poem about the seasons changing' },
  { level: 'A1', category: 'poem', topic: 'A poem about a dog waiting for its owner' },
  { level: 'A1', category: 'poem', topic: 'A poem about rain on the window' },
  { level: 'A1', category: 'poem', topic: 'A poem about the moon at night' },
  { level: 'A1', category: 'poem', topic: 'A poem about a red apple' },
  { level: 'A1', category: 'poem', topic: 'A poem about the sea' },
  { level: 'A1', category: 'poem', topic: 'A poem about a butterfly' },
  { level: 'A1', category: 'poem', topic: "A poem about a child's room" },
  { level: 'A1', category: 'poem', topic: 'A poem about winter morning frost' },
  { level: 'A1', category: 'poem', topic: 'A poem about Sunday silence' },

  // ── A1: Blog (15) ──
  { level: 'A1', category: 'blog', topic: 'My favourite food: Kartoffelsuppe' },
  { level: 'A1', category: 'blog', topic: 'Why I love autumn' },
  { level: 'A1', category: 'blog', topic: 'A day at the beach' },
  { level: 'A1', category: 'blog', topic: 'My morning routine' },
  { level: 'A1', category: 'blog', topic: 'My pet rabbit' },
  { level: 'A1', category: 'blog', topic: 'Learning to swim' },
  { level: 'A1', category: 'blog', topic: 'My favourite colour and why' },
  { level: 'A1', category: 'blog', topic: 'The market near my house' },
  { level: 'A1', category: 'blog', topic: 'What I eat for breakfast' },
  { level: 'A1', category: 'blog', topic: 'My favourite sport' },
  { level: 'A1', category: 'blog', topic: 'The bus ride to school' },
  { level: 'A1', category: 'blog', topic: 'What I do on rainy days' },
  { level: 'A1', category: 'blog', topic: 'My best friend' },
  { level: 'A1', category: 'blog', topic: 'A birthday party' },
  { level: 'A1', category: 'blog', topic: 'Going to the cinema for the first time' },

  // ── A1: Journal (10) ──
  { level: 'A1', category: 'journal', topic: 'A short diary entry about a school day' },
  { level: 'A1', category: 'journal', topic: 'Diary: my first day in a new city' },
  { level: 'A1', category: 'journal', topic: 'Diary: a rainy Saturday at home' },
  { level: 'A1', category: 'journal', topic: 'Diary: my birthday' },
  { level: 'A1', category: 'journal', topic: 'Diary: a visit to the doctor' },
  { level: 'A1', category: 'journal', topic: 'Diary: I cooked dinner alone for the first time' },
  { level: 'A1', category: 'journal', topic: 'Diary: a Sunday at grandma\'s house' },
  { level: 'A1', category: 'journal', topic: 'Diary: going to the market with mum' },
  { level: 'A1', category: 'journal', topic: 'Diary: my first swimming lesson' },
  { level: 'A1', category: 'journal', topic: 'Diary: a snowy day and building an igloo' },

  // ── A2: News (20) ──
  { level: 'A2', category: 'news', topic: 'A new train line connects two German cities' },
  { level: 'A2', category: 'news', topic: 'Germans travel more by bicycle than before' },
  { level: 'A2', category: 'news', topic: 'A popular singer gives a free concert in a park' },
  { level: 'A2', category: 'news', topic: 'A new café offers healthy fast food in Berlin' },
  { level: 'A2', category: 'news', topic: 'More Germans are learning to cook at home' },
  { level: 'A2', category: 'news', topic: 'A town in Bavaria bans plastic bags' },
  { level: 'A2', category: 'news', topic: 'A young woman swims across the Rhine for charity' },
  { level: 'A2', category: 'news', topic: 'Germany introduces free museums for under-18s' },
  { level: 'A2', category: 'news', topic: 'A new app helps people learn German sign language' },
  { level: 'A2', category: 'news', topic: 'A school in Hamburg grows its own vegetables' },
  { level: 'A2', category: 'news', topic: 'A record number of tourists visit Neuschwanstein castle' },
  { level: 'A2', category: 'news', topic: 'A baker in Cologne wins a prize for the best Stollen' },
  { level: 'A2', category: 'news', topic: 'Vienna metro gets free wifi' },
  { level: 'A2', category: 'news', topic: 'A new hotel is made entirely of wood' },
  { level: 'A2', category: 'news', topic: 'Children in Germany spend less time watching TV' },
  { level: 'A2', category: 'news', topic: 'A German teenager invents a clever recycling box' },
  { level: 'A2', category: 'news', topic: 'Solar panels on school roofs save money' },
  { level: 'A2', category: 'news', topic: 'A couple walks across Germany for climate awareness' },
  { level: 'A2', category: 'news', topic: 'Zürich is voted the cleanest city in the world again' },
  { level: 'A2', category: 'news', topic: 'A pet shelter finds homes for 200 animals in one weekend' },

  // ── A2: Story (40) ──
  { level: 'A2', category: 'story', topic: 'A student finds a wallet and returns it to the owner' },
  { level: 'A2', category: 'story', topic: 'A woman moves to a new apartment and meets her neighbours' },
  { level: 'A2', category: 'story', topic: 'Two colleagues share a lunch break and become friends' },
  { level: 'A2', category: 'story', topic: 'A man tries to fix his broken bicycle himself' },
  { level: 'A2', category: 'story', topic: 'A young woman travels by train alone for the first time' },
  { level: 'A2', category: 'story', topic: 'A teenager tries a new sport and surprises everyone' },
  { level: 'A2', category: 'story', topic: 'A family gets lost on a hiking trip' },
  { level: 'A2', category: 'story', topic: 'A man misses the last bus and walks home in the rain' },
  { level: 'A2', category: 'story', topic: 'A woman buys an old painting at a flea market' },
  { level: 'A2', category: 'story', topic: 'A student prepares for an important exam' },
  { level: 'A2', category: 'story', topic: 'Two strangers share a table in a busy café' },
  { level: 'A2', category: 'story', topic: 'A woman gets a surprise phone call from an old friend' },
  { level: 'A2', category: 'story', topic: 'A man learns to dance for his daughter\'s wedding' },
  { level: 'A2', category: 'story', topic: 'A teenager starts a part-time job at a florist' },
  { level: 'A2', category: 'story', topic: 'A family plans a summer holiday by the sea' },
  { level: 'A2', category: 'story', topic: 'A man cooks an Italian dish and it goes wrong' },
  { level: 'A2', category: 'story', topic: 'A woman forgets her bag on the train' },
  { level: 'A2', category: 'story', topic: 'A young man visits a city for the first time' },
  { level: 'A2', category: 'story', topic: 'A girl learns to play the guitar' },
  { level: 'A2', category: 'story', topic: 'An elderly man grows tomatoes on his balcony' },
  { level: 'A2', category: 'story', topic: 'A student has to give a presentation at school' },
  { level: 'A2', category: 'story', topic: 'A woman adopts a rescue dog' },
  { level: 'A2', category: 'story', topic: 'Two neighbours disagree about a tree' },
  { level: 'A2', category: 'story', topic: 'A man wins a small prize in a lottery' },
  { level: 'A2', category: 'story', topic: 'A woman starts learning to paint at age 50' },
  { level: 'A2', category: 'story', topic: 'A young couple argues about where to live' },
  { level: 'A2', category: 'story', topic: 'A student works as a waiter in the evenings' },
  { level: 'A2', category: 'story', topic: 'A man goes fishing with his son for the first time' },
  { level: 'A2', category: 'story', topic: 'A teenager volunteers at an animal shelter' },
  { level: 'A2', category: 'story', topic: 'A woman repairs a dress she has had for 30 years' },
  { level: 'A2', category: 'story', topic: 'A family installs solar panels on their house' },
  { level: 'A2', category: 'story', topic: 'A man tries to learn cooking from online videos' },
  { level: 'A2', category: 'story', topic: 'A teenager gets their first mobile phone' },
  { level: 'A2', category: 'story', topic: 'A woman takes a language class and meets new people' },
  { level: 'A2', category: 'story', topic: 'A man surprises his wife with a romantic picnic' },
  { level: 'A2', category: 'story', topic: 'A student fails a test and decides to study harder' },
  { level: 'A2', category: 'story', topic: 'A boy and his grandfather build a birdhouse' },
  { level: 'A2', category: 'story', topic: 'A woman joins a running club and trains for a 5K' },
  { level: 'A2', category: 'story', topic: 'A family celebrates Christmas in a new way' },
  { level: 'A2', category: 'story', topic: 'A man gets a haircut at a new barber and is unhappy' },

  // ── A2: Poem (10) ──
  { level: 'A2', category: 'poem', topic: 'A poem about city life at night' },
  { level: 'A2', category: 'poem', topic: 'A poem about a grandmother\'s hands' },
  { level: 'A2', category: 'poem', topic: 'A poem about the smell of fresh bread' },
  { level: 'A2', category: 'poem', topic: 'A poem about homesickness' },
  { level: 'A2', category: 'poem', topic: 'A poem about the last day of summer' },
  { level: 'A2', category: 'poem', topic: 'A poem about a rainy Monday morning' },
  { level: 'A2', category: 'poem', topic: 'A poem about friendship' },
  { level: 'A2', category: 'poem', topic: 'A poem about an old train station' },
  { level: 'A2', category: 'poem', topic: 'A poem about the first warm day in spring' },
  { level: 'A2', category: 'poem', topic: 'A poem about a river through a city' },

  // ── A2: Blog (20) ──
  { level: 'A2', category: 'blog', topic: 'My experience at a German Christmas market' },
  { level: 'A2', category: 'blog', topic: 'How I learned to cook Schnitzel' },
  { level: 'A2', category: 'blog', topic: 'My weekend in Munich' },
  { level: 'A2', category: 'blog', topic: 'Why I started cycling to work' },
  { level: 'A2', category: 'blog', topic: 'Learning German: my first three months' },
  { level: 'A2', category: 'blog', topic: 'My favourite walk in the Black Forest' },
  { level: 'A2', category: 'blog', topic: 'A day trip to the Rhine valley' },
  { level: 'A2', category: 'blog', topic: 'Why I love German bread' },
  { level: 'A2', category: 'blog', topic: 'My experience at a German Volksfest' },
  { level: 'A2', category: 'blog', topic: 'What I miss about living in Germany' },
  { level: 'A2', category: 'blog', topic: 'How I decorate my apartment in autumn' },
  { level: 'A2', category: 'blog', topic: 'My first time in an Austrian spa' },
  { level: 'A2', category: 'blog', topic: 'Five things I love about Berlin' },
  { level: 'A2', category: 'blog', topic: 'How Germans celebrate birthdays differently' },
  { level: 'A2', category: 'blog', topic: 'My language exchange partner' },
  { level: 'A2', category: 'blog', topic: 'The best Döner Kebab in the city' },
  { level: 'A2', category: 'blog', topic: 'An evening at a German beer garden' },
  { level: 'A2', category: 'blog', topic: 'My Sunday morning routine in winter' },
  { level: 'A2', category: 'blog', topic: 'Why I switched from coffee to tea' },
  { level: 'A2', category: 'blog', topic: 'A day without my phone' },

  // ── A2: Journal (15) ──
  { level: 'A2', category: 'journal', topic: 'Diary: starting a new job' },
  { level: 'A2', category: 'journal', topic: 'Diary: first week in a new city' },
  { level: 'A2', category: 'journal', topic: 'Diary: a difficult conversation with a friend' },
  { level: 'A2', category: 'journal', topic: 'Diary: travelling alone by train' },
  { level: 'A2', category: 'journal', topic: 'Diary: trying yoga for the first time' },
  { level: 'A2', category: 'journal', topic: 'Diary: a weekend at a lake' },
  { level: 'A2', category: 'journal', topic: 'Diary: meeting an old school friend' },
  { level: 'A2', category: 'journal', topic: 'Diary: my first apartment' },
  { level: 'A2', category: 'journal', topic: 'Diary: an evening at the theatre' },
  { level: 'A2', category: 'journal', topic: 'Diary: a flat tire on the way to work' },
  { level: 'A2', category: 'journal', topic: 'Diary: learning to bake Strudel' },
  { level: 'A2', category: 'journal', topic: 'Diary: a night of bad weather and good company' },
  { level: 'A2', category: 'journal', topic: 'Diary: saying goodbye to a colleague' },
  { level: 'A2', category: 'journal', topic: 'Diary: visiting a museum alone on a weekday' },
  { level: 'A2', category: 'journal', topic: 'Diary: growing herbs on my windowsill' },

  // ── A2: Culture (10) ──
  { level: 'A2', category: 'culture', topic: 'The tradition of Karneval in Cologne' },
  { level: 'A2', category: 'culture', topic: 'How Germans celebrate Easter' },
  { level: 'A2', category: 'culture', topic: 'The Autobahn: Germany\'s famous motorway' },
  { level: 'A2', category: 'culture', topic: 'German punctuality: a cultural trait' },
  { level: 'A2', category: 'culture', topic: 'Bread culture in Germany: over 3000 varieties' },
  { level: 'A2', category: 'culture', topic: 'The tradition of Sunday walks in Germany' },
  { level: 'A2', category: 'culture', topic: 'Swiss cheese: more than just Emmentaler' },
  { level: 'A2', category: 'culture', topic: 'Austrian classical music and its heritage' },
  { level: 'A2', category: 'culture', topic: 'The Berliner Currywurst: street food icon' },
  { level: 'A2', category: 'culture', topic: 'Why Germans love allotment gardens (Kleingärten)' },

  // ── B1: News (30) ──
  { level: 'B1', category: 'news', topic: 'Germany plans to phase out coal by 2038' },
  { level: 'B1', category: 'news', topic: 'A study shows teenagers sleep less than 30 years ago' },
  { level: 'B1', category: 'news', topic: 'Vienna named the most liveable city for the fifth year' },
  { level: 'B1', category: 'news', topic: 'German supermarkets reduce food waste with new app' },
  { level: 'B1', category: 'news', topic: 'More German companies offer a four-day work week' },
  { level: 'B1', category: 'news', topic: 'A new report on loneliness in urban Germany' },
  { level: 'B1', category: 'news', topic: 'The rise of vegetarianism in German-speaking countries' },
  { level: 'B1', category: 'news', topic: 'Germany invests in hydrogen-powered trains' },
  { level: 'B1', category: 'news', topic: 'Austrian researchers develop a biodegradable plastic' },
  { level: 'B1', category: 'news', topic: 'A new law protects tenants from rising rents in Berlin' },
  { level: 'B1', category: 'news', topic: 'Mental health awareness grows in German workplaces' },
  { level: 'B1', category: 'news', topic: 'A German city bans cars from its old town centre' },
  { level: 'B1', category: 'news', topic: 'Streaming now more popular than TV in Germany' },
  { level: 'B1', category: 'news', topic: 'The shortage of skilled workers in German industry' },
  { level: 'B1', category: 'news', topic: 'How Germany is responding to its ageing population' },
  { level: 'B1', category: 'news', topic: 'A record number of people cycle to work in Hamburg' },
  { level: 'B1', category: 'news', topic: 'Zürich opens Europe\'s first solar-powered tram line' },
  { level: 'B1', category: 'news', topic: 'German fashion brands move towards sustainable materials' },
  { level: 'B1', category: 'news', topic: 'Rising house prices force young people out of cities' },
  { level: 'B1', category: 'news', topic: 'A survey: half of Germans feel too stressed at work' },
  { level: 'B1', category: 'news', topic: 'Internet access still unequal across German regions' },
  { level: 'B1', category: 'news', topic: 'Germany becomes the largest market for e-books in Europe' },
  { level: 'B1', category: 'news', topic: 'A new study links social media use to anxiety in teens' },
  { level: 'B1', category: 'news', topic: 'Germany\'s birth rate falls to its lowest in a decade' },
  { level: 'B1', category: 'news', topic: 'Migrants bring new energy to rural German communities' },
  { level: 'B1', category: 'news', topic: 'A German scientist wins an international environment prize' },
  { level: 'B1', category: 'news', topic: 'School meals become free in three German states' },
  { level: 'B1', category: 'news', topic: 'The black market for concert tickets worries authorities' },
  { level: 'B1', category: 'news', topic: 'Animal-free farming practices gain ground in Bavaria' },
  { level: 'B1', category: 'news', topic: 'A record heat wave hits central Europe in summer' },

  // ── B1: Story (30) ──
  { level: 'B1', category: 'story', topic: 'A woman discovers her grandfather was a famous artist' },
  { level: 'B1', category: 'story', topic: 'A man quits his well-paid job to become a beekeeper' },
  { level: 'B1', category: 'story', topic: 'A teenager finds old love letters in the attic' },
  { level: 'B1', category: 'story', topic: 'Two strangers are stranded at an airport overnight' },
  { level: 'B1', category: 'story', topic: 'A woman returns to her hometown after twenty years' },
  { level: 'B1', category: 'story', topic: 'A journalist writes about a town that time forgot' },
  { level: 'B1', category: 'story', topic: 'A software engineer decides to hike across Germany' },
  { level: 'B1', category: 'story', topic: 'An elderly couple celebrates 50 years of marriage' },
  { level: 'B1', category: 'story', topic: 'A student starts a podcast in German to practise speaking' },
  { level: 'B1', category: 'story', topic: 'A chef opens a restaurant that serves only seasonal food' },
  { level: 'B1', category: 'story', topic: 'A mother and daughter go on a road trip through Austria' },
  { level: 'B1', category: 'story', topic: 'A man learns his neighbour is a former Olympic athlete' },
  { level: 'B1', category: 'story', topic: 'A woman reconnects with her roots through traditional music' },
  { level: 'B1', category: 'story', topic: 'A student interviews their oldest relative about the past' },
  { level: 'B1', category: 'story', topic: 'A librarian finds a hidden note inside a very old book' },
  { level: 'B1', category: 'story', topic: 'A man tries to stop his father from selling the family house' },
  { level: 'B1', category: 'story', topic: 'A young woman builds her own tiny house from scratch' },
  { level: 'B1', category: 'story', topic: 'A musician loses his inspiration and tries to find it again' },
  { level: 'B1', category: 'story', topic: 'A family debates whether to adopt a second child' },
  { level: 'B1', category: 'story', topic: 'A woman finds out her colleague has been lying' },
  { level: 'B1', category: 'story', topic: 'A night guard at a museum has an unusual experience' },
  { level: 'B1', category: 'story', topic: 'A boy with dyslexia discovers a talent for numbers' },
  { level: 'B1', category: 'story', topic: 'A retired teacher starts teaching adults online' },
  { level: 'B1', category: 'story', topic: 'A couple argues about whether to have children' },
  { level: 'B1', category: 'story', topic: 'A farmer\'s daughter moves to Berlin to study philosophy' },
  { level: 'B1', category: 'story', topic: 'A man learns his favourite café is closing next month' },
  { level: 'B1', category: 'story', topic: 'A woman starts a community composting project in her city' },
  { level: 'B1', category: 'story', topic: 'A photographer travels the Moselle river and documents life along it' },
  { level: 'B1', category: 'story', topic: 'A university student earns money by selling homemade jam' },
  { level: 'B1', category: 'story', topic: 'A man challenges himself to speak only German for a month' },

  // ── B1: Blog (20) ──
  { level: 'B1', category: 'blog', topic: 'Why I gave up meat for a month' },
  { level: 'B1', category: 'blog', topic: 'My experience at a German language course in Freiburg' },
  { level: 'B1', category: 'blog', topic: 'How minimalism changed my life' },
  { level: 'B1', category: 'blog', topic: 'What I learned from a digital detox weekend' },
  { level: 'B1', category: 'blog', topic: 'Living in Germany as a foreigner: what surprised me most' },
  { level: 'B1', category: 'blog', topic: 'The German approach to work-life balance' },
  { level: 'B1', category: 'blog', topic: 'Why I moved from the city to the countryside' },
  { level: 'B1', category: 'blog', topic: 'How meditation helped with my anxiety' },
  { level: 'B1', category: 'blog', topic: 'My year of reading only German books' },
  { level: 'B1', category: 'blog', topic: 'The joy of wild swimming in Bavaria' },
  { level: 'B1', category: 'blog', topic: 'Why I love taking the night train in Europe' },
  { level: 'B1', category: 'blog', topic: 'The beauty of slow travel' },
  { level: 'B1', category: 'blog', topic: 'What nobody tells you about learning a second language' },
  { level: 'B1', category: 'blog', topic: 'Five reasons to visit Vienna in winter' },
  { level: 'B1', category: 'blog', topic: 'How I started freelancing after 10 years in a office job' },
  { level: 'B1', category: 'blog', topic: 'What I wish I had known before moving abroad' },
  { level: 'B1', category: 'blog', topic: 'The simple pleasure of a Sunday Frühschoppen' },
  { level: 'B1', category: 'blog', topic: 'Zero-waste living: my first six months' },
  { level: 'B1', category: 'blog', topic: 'Why the Bodensee is Germany\'s best-kept secret' },
  { level: 'B1', category: 'blog', topic: 'Lessons from a month of hiking in Switzerland' },

  // ── B1: Culture (15) ──
  { level: 'B1', category: 'culture', topic: 'The significance of the Weimar Republic for German culture' },
  { level: 'B1', category: 'culture', topic: 'Expressionism: Germany\'s contribution to modern art' },
  { level: 'B1', category: 'culture', topic: 'Why Germans love their allotment gardens' },
  { level: 'B1', category: 'culture', topic: 'The Ruhr area: from coal to culture' },
  { level: 'B1', category: 'culture', topic: 'The German love of hiking: a cultural history' },
  { level: 'B1', category: 'culture', topic: 'Street art in Berlin: a guide' },
  { level: 'B1', category: 'culture', topic: 'How food tells the story of German reunification' },
  { level: 'B1', category: 'culture', topic: 'The Swiss militia system and national identity' },
  { level: 'B1', category: 'culture', topic: 'Fasching vs Karneval: regional differences' },
  { level: 'B1', category: 'culture', topic: 'How Germany has changed since reunification' },
  { level: 'B1', category: 'culture', topic: 'The Biedermeier era: comfort and conformity' },
  { level: 'B1', category: 'culture', topic: 'The influence of immigrants on German cuisine' },
  { level: 'B1', category: 'culture', topic: 'The German tradition of the Adventskalender' },
  { level: 'B1', category: 'culture', topic: 'The role of the church in Austrian daily life' },
  { level: 'B1', category: 'culture', topic: 'Why Germany is a world leader in board games' },

  // ── B1: Science (10) ──
  { level: 'B1', category: 'science', topic: 'How trees communicate through root networks' },
  { level: 'B1', category: 'science', topic: 'The science behind why we dream' },
  { level: 'B1', category: 'science', topic: 'How vaccines work in simple terms' },
  { level: 'B1', category: 'science', topic: 'Why bees are crucial for our food supply' },
  { level: 'B1', category: 'science', topic: 'The impact of light pollution on nocturnal animals' },
  { level: 'B1', category: 'science', topic: 'How microplastics enter our food chain' },
  { level: 'B1', category: 'science', topic: 'The psychology of habits: how they form and how to break them' },
  { level: 'B1', category: 'science', topic: 'Why exercise is good for mental health' },
  { level: 'B1', category: 'science', topic: 'How volcanoes form and why they erupt' },
  { level: 'B1', category: 'science', topic: 'The science of sleep deprivation' },

  // ── B1: Journal (15) ──
  { level: 'B1', category: 'journal', topic: 'Diary: my first week working abroad' },
  { level: 'B1', category: 'journal', topic: 'Diary: realising I need to change careers' },
  { level: 'B1', category: 'journal', topic: 'Diary: a difficult conversation with my boss' },
  { level: 'B1', category: 'journal', topic: 'Diary: completing a marathon after months of training' },
  { level: 'B1', category: 'journal', topic: 'Diary: a weekend volunteering at a food bank' },
  { level: 'B1', category: 'journal', topic: 'Diary: learning to accept failure' },
  { level: 'B1', category: 'journal', topic: 'Diary: my last day in a city I loved' },
  { level: 'B1', category: 'journal', topic: 'Diary: a night alone in the mountains' },
  { level: 'B1', category: 'journal', topic: 'Diary: deciding to go back to university at 35' },
  { level: 'B1', category: 'journal', topic: 'Diary: the week my mother visited for the first time' },
  { level: 'B1', category: 'journal', topic: 'Diary: dealing with creative block' },
  { level: 'B1', category: 'journal', topic: 'Diary: an unexpected conversation on a train' },
  { level: 'B1', category: 'journal', topic: 'Diary: living with a chronic illness' },
  { level: 'B1', category: 'journal', topic: 'Diary: learning to say no' },
  { level: 'B1', category: 'journal', topic: 'Diary: a month of waking up at 5am' },

  // ── B2: News (20) ──
  { level: 'B2', category: 'news', topic: 'The debate over rent control in German cities' },
  { level: 'B2', category: 'news', topic: 'Germany\'s role in European defence policy' },
  { level: 'B2', category: 'news', topic: 'The economic consequences of an ageing society' },
  { level: 'B2', category: 'news', topic: 'AI assistants in German hospitals: ethical questions' },
  { level: 'B2', category: 'news', topic: 'The far-right surge and its implications for German politics' },
  { level: 'B2', category: 'news', topic: 'Germany\'s difficult relationship with its colonial past' },
  { level: 'B2', category: 'news', topic: 'How climate migration will reshape European demographics' },
  { level: 'B2', category: 'news', topic: 'The gig economy: flexibility or precarity?' },
  { level: 'B2', category: 'news', topic: 'Nuclear energy: Germany rethinks its exit' },
  { level: 'B2', category: 'news', topic: 'The crisis of trust in German public institutions' },
  { level: 'B2', category: 'news', topic: 'Switzerland\'s direct democracy: a model for others?' },
  { level: 'B2', category: 'news', topic: 'How German companies are adapting to deglobalisation' },
  { level: 'B2', category: 'news', topic: 'The declining influence of major German newspapers' },
  { level: 'B2', category: 'news', topic: 'Austria\'s housing crisis: causes and potential solutions' },
  { level: 'B2', category: 'news', topic: 'The ethics of facial recognition in public spaces' },
  { level: 'B2', category: 'news', topic: 'Germany\'s Zeitenwende: a turning point in foreign policy' },
  { level: 'B2', category: 'news', topic: 'The resurgence of vinyl records in the streaming age' },
  { level: 'B2', category: 'news', topic: 'Urban heat islands: why cities are getting hotter' },
  { level: 'B2', category: 'news', topic: 'The mental health crisis among German medical students' },
  { level: 'B2', category: 'news', topic: 'How German media covered its own government\'s failure' },

  // ── B2: Story (20) ──
  { level: 'B2', category: 'story', topic: 'An architect discovers her award-winning building will be demolished' },
  { level: 'B2', category: 'story', topic: 'A former Stasi informant faces someone he once reported' },
  { level: 'B2', category: 'story', topic: 'A translator realises a word in a document cannot be translated' },
  { level: 'B2', category: 'story', topic: 'A woman inherits a vineyard she has never visited' },
  { level: 'B2', category: 'story', topic: 'A documentary filmmaker questions whether their film does harm' },
  { level: 'B2', category: 'story', topic: 'Two old friends reconnect and realise they have grown apart' },
  { level: 'B2', category: 'story', topic: 'A whistleblower weighs up what to do with evidence of wrongdoing' },
  { level: 'B2', category: 'story', topic: 'A refugee builds a new life but feels between two worlds' },
  { level: 'B2', category: 'story', topic: 'A professor is asked to defend a student whose work she suspects is plagiarised' },
  { level: 'B2', category: 'story', topic: 'A man finds out he was adopted and starts looking for his biological family' },
  { level: 'B2', category: 'story', topic: 'A novelist struggles to write a book about her own traumatic experience' },
  { level: 'B2', category: 'story', topic: 'A politician must choose between loyalty and conscience' },
  { level: 'B2', category: 'story', topic: 'An AI researcher begins to worry about the technology she created' },
  { level: 'B2', category: 'story', topic: 'A nurse decides to speak out about conditions in her hospital' },
  { level: 'B2', category: 'story', topic: 'A businessman returns to his village after 25 years and finds it changed' },
  { level: 'B2', category: 'story', topic: 'A historian uncovers evidence that changes how a battle is understood' },
  { level: 'B2', category: 'story', topic: 'An expat returns to Germany and finds it unfamiliar' },
  { level: 'B2', category: 'story', topic: 'A therapist begins to sympathise too strongly with one patient' },
  { level: 'B2', category: 'story', topic: 'A woman starts a legal fight to reclaim art looted from her family' },
  { level: 'B2', category: 'story', topic: 'An investigative journalist follows a money trail in local politics' },

  // ── B2: Science (15) ──
  { level: 'B2', category: 'science', topic: 'CRISPR gene editing: promise and ethical dilemmas' },
  { level: 'B2', category: 'science', topic: 'The neuroscience of addiction' },
  { level: 'B2', category: 'science', topic: 'Dark matter: what we know and what we don\'t' },
  { level: 'B2', category: 'science', topic: 'How antibiotic resistance is becoming a global crisis' },
  { level: 'B2', category: 'science', topic: 'The cognitive benefits of bilingualism' },
  { level: 'B2', category: 'science', topic: 'How epigenetics changes our understanding of inheritance' },
  { level: 'B2', category: 'science', topic: 'The psychology of confirmation bias' },
  { level: 'B2', category: 'science', topic: 'Ocean acidification and its effects on marine life' },
  { level: 'B2', category: 'science', topic: 'The physics of black holes explained' },
  { level: 'B2', category: 'science', topic: 'The gut microbiome and mental health' },
  { level: 'B2', category: 'science', topic: 'How machine learning recognises patterns in medical images' },
  { level: 'B2', category: 'science', topic: 'The role of dopamine in motivation and reward' },
  { level: 'B2', category: 'science', topic: 'Rewilding: can we restore lost ecosystems?' },
  { level: 'B2', category: 'science', topic: 'The science and controversy of nuclear fusion' },
  { level: 'B2', category: 'science', topic: 'How urban greening reduces heat and improves health' },

  // ── B2: Culture (10) ──
  { level: 'B2', category: 'culture', topic: 'Brecht\'s epic theatre and its political legacy' },
  { level: 'B2', category: 'culture', topic: 'The ambivalent legacy of Richard Wagner' },
  { level: 'B2', category: 'culture', topic: 'How the Bauhaus movement shaped modern design' },
  { level: 'B2', category: 'culture', topic: 'The German concept of Vergangenheitsbewältigung' },
  { level: 'B2', category: 'culture', topic: 'Franz Kafka and the anxiety of modern life' },
  { level: 'B2', category: 'culture', topic: 'The Berlin art scene after reunification' },
  { level: 'B2', category: 'culture', topic: 'How punk arrived in East Germany and what it meant' },
  { level: 'B2', category: 'culture', topic: 'Ostalgie: nostalgia for the GDR' },
  { level: 'B2', category: 'culture', topic: 'The Austrian Secession and Vienna 1900' },
  { level: 'B2', category: 'culture', topic: 'German philosophy and the concept of Weltschmerz' },

  // ── B2: Blog (10) ──
  { level: 'B2', category: 'blog', topic: 'Why I am increasingly sceptical of social media influencers' },
  { level: 'B2', category: 'blog', topic: 'The uncomfortable truth about eco-tourism' },
  { level: 'B2', category: 'blog', topic: 'On the difficulty of truly changing one\'s mind' },
  { level: 'B2', category: 'blog', topic: 'What my year without buying new clothes taught me' },
  { level: 'B2', category: 'blog', topic: 'Living in Germany: the bureaucracy nobody warns you about' },
  { level: 'B2', category: 'blog', topic: 'The false promise of productivity culture' },
  { level: 'B2', category: 'blog', topic: 'Why I regret going to university' },
  { level: 'B2', category: 'blog', topic: 'The loneliness epidemic nobody is talking about' },
  { level: 'B2', category: 'blog', topic: 'On grief and what it teaches us about love' },
  { level: 'B2', category: 'blog', topic: 'Why I left my startup and what I learned' },

  // ── B2: Poem (5) ──
  { level: 'B2', category: 'poem', topic: 'A poem about the passage of time and memory' },
  { level: 'B2', category: 'poem', topic: 'A poem about the weight of unspoken words' },
  { level: 'B2', category: 'poem', topic: 'A poem about industrial landscapes' },
  { level: 'B2', category: 'poem', topic: 'A poem about exile and belonging' },
  { level: 'B2', category: 'poem', topic: 'A poem about the relationship between language and identity' },

  // ── C1: Science (10) ──
  { level: 'C1', category: 'science', topic: 'The philosophical implications of artificial consciousness' },
  { level: 'C1', category: 'science', topic: 'The methodological problem of reproducibility in science' },
  { level: 'C1', category: 'science', topic: 'The ethics of human enhancement through biotechnology' },
  { level: 'C1', category: 'science', topic: 'String theory: beauty without empirical proof' },
  { level: 'C1', category: 'science', topic: 'The Fermi paradox and what it implies about intelligence' },
  { level: 'C1', category: 'science', topic: 'Consciousness and the hard problem in cognitive science' },
  { level: 'C1', category: 'science', topic: 'The evolutionary origins of altruism' },
  { level: 'C1', category: 'science', topic: 'Neuroplasticity: how experience reshapes the brain' },
  { level: 'C1', category: 'science', topic: 'The anthropic principle and the fine-tuning of the universe' },
  { level: 'C1', category: 'science', topic: 'How game theory applies to international diplomacy' },

  // ── C1: Culture (10) ──
  { level: 'C1', category: 'culture', topic: 'The reception of Nietzsche in German cultural history' },
  { level: 'C1', category: 'culture', topic: 'Thomas Mann\'s ambivalence about German identity' },
  { level: 'C1', category: 'culture', topic: 'Hannah Arendt and the banality of evil' },
  { level: 'C1', category: 'culture', topic: 'The Frankfurt School and the critique of mass culture' },
  { level: 'C1', category: 'culture', topic: 'The architecture of power: Albert Speer and Nazi urbanism' },
  { level: 'C1', category: 'culture', topic: 'Christa Wolf and the literature of the GDR' },
  { level: 'C1', category: 'culture', topic: 'The concept of Bildung in German intellectual history' },
  { level: 'C1', category: 'culture', topic: 'The Enlightenment and the German Aufklärung' },
  { level: 'C1', category: 'culture', topic: 'Heidegger\'s political entanglement and its philosophical legacy' },
  { level: 'C1', category: 'culture', topic: 'Walther von der Vogelweide and the tradition of Minnesang' },

  // ── C1: News (5) ──
  { level: 'C1', category: 'news', topic: 'The constitutionality of emergency government measures in Germany' },
  { level: 'C1', category: 'news', topic: 'Geopolitical implications of Germany\'s energy dependency' },
  { level: 'C1', category: 'news', topic: 'The structural reform of Germany\'s pension system' },
  { level: 'C1', category: 'news', topic: 'Disinformation campaigns and the resilience of democratic institutions' },
  { level: 'C1', category: 'news', topic: 'The paradox of economic growth and ecological sustainability' },

  // ── C1: Blog (5) ──
  { level: 'C1', category: 'blog', topic: 'On the impossibility of neutrality in journalism' },
  { level: 'C1', category: 'blog', topic: 'The seduction of intellectual certainty' },
  { level: 'C1', category: 'blog', topic: 'Why I became a historian and what the discipline has taught me' },
  { level: 'C1', category: 'blog', topic: 'On translation as a form of interpretation' },
  { level: 'C1', category: 'blog', topic: 'What Wittgenstein\'s remark about language actually means' },

  // ── C2: Story (5) ──
  { level: 'C2', category: 'story', topic: 'A philosopher on his deathbed revises his lifelong thesis' },
  { level: 'C2', category: 'story', topic: 'A survivor of an authoritarian regime refuses to give a public account' },
  { level: 'C2', category: 'story', topic: 'An archive is destroyed and a historian must reconstruct it from memory' },
  { level: 'C2', category: 'story', topic: 'A linguist studies a dying dialect and becomes its last speaker' },
  { level: 'C2', category: 'story', topic: 'A poet realises the poem she most wants to write cannot be written' },

  // ── C2: Poem (5) ──
  { level: 'C2', category: 'poem', topic: 'A poem meditating on the act of translation itself' },
  { level: 'C2', category: 'poem', topic: 'A poem exploring silence as language' },
  { level: 'C2', category: 'poem', topic: 'A poem about the relationship between forgetting and forgiveness' },
  { level: 'C2', category: 'poem', topic: 'A poem in the tradition of Celan on language after catastrophe' },
  { level: 'C2', category: 'poem', topic: 'A poem about the impossibility of return' },

  // ── C2: Culture (5) ──
  { level: 'C2', category: 'culture', topic: 'The interplay of fate and freedom in German Romanticism' },
  { level: 'C2', category: 'culture', topic: 'Adorno\'s aesthetic theory and its relevance today' },
  { level: 'C2', category: 'culture', topic: 'The figure of the Wanderer in German art and literature' },
  { level: 'C2', category: 'culture', topic: 'Benjamin\'s Arcades Project and the archaeology of modernity' },
  { level: 'C2', category: 'culture', topic: 'Rilke\'s Duino Elegies and the problem of modern existence' },

  // ── C2: Science (5) ──
  { level: 'C2', category: 'science', topic: 'The epistemological limits of scientific knowledge' },
  { level: 'C2', category: 'science', topic: 'Gödel\'s incompleteness theorems and what they tell us about mathematics' },
  { level: 'C2', category: 'science', topic: 'The measurement problem in quantum mechanics and its interpretations' },
  { level: 'C2', category: 'science', topic: 'Temporal paradoxes and the arrow of time in physics' },
  { level: 'C2', category: 'science', topic: 'The mind-body problem and modern neuroscience' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[äöüß]/g, (c) => ({ ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' }[c] ?? c))
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

function storyExists(slug: string): boolean {
  return fs.existsSync(path.join(STORIES_DIR, `${slug}.json`));
}

function getNextId(): number {
  const files = fs.readdirSync(STORIES_DIR).filter((f) => f.endsWith('.json'));
  if (files.length === 0) return 1;
  const ids = files.map((f) => {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(STORIES_DIR, f), 'utf-8'));
      return parseInt(data.id, 10) || 0;
    } catch {
      return 0;
    }
  });
  return Math.max(...ids) + 1;
}

function rebuildMeta() {
  const files = fs
    .readdirSync(STORIES_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort();

  const meta = files.map((f) => {
    const s = JSON.parse(fs.readFileSync(path.join(STORIES_DIR, f), 'utf-8'));
    return {
      id: s.id,
      slug: s.slug,
      title: s.title,
      level: s.level,
      category: s.category,
      sentenceCount: s.sentences?.length ?? 0,
      vocabCount: s.vocabulary?.length ?? 0,
    };
  });

  fs.writeFileSync(META_PATH, JSON.stringify(meta, null, 2));
  return meta.length;
}

// ─── Generation ───────────────────────────────────────────────────────────────

const client = new Anthropic();

async function generateStory(
  spec: TopicSpec,
  id: number,
  slug: string
): Promise<void> {
  const levelGuidance: Record<CEFRLevel, string> = {
    A1: 'Very simple present tense only. Max 8-word sentences. Basic everyday vocabulary. No subordinate clauses.',
    A2: 'Simple sentences, some compound sentences with "und/aber/oder". Present and past tense. Common vocabulary.',
    B1: 'Moderate complexity. Mix of tenses. Some subordinate clauses. B1-level vocabulary with idioms.',
    B2: 'Complex sentences, passive voice, subjunctive mood allowed. Abstract vocabulary welcome.',
    C1: 'Sophisticated syntax. Rich vocabulary. Nuanced argumentation. Academic or literary register.',
    C2: 'Literary or academic German. Complex rhetorical structures. Full stylistic range.',
  };

  const sentenceCount: Record<CEFRLevel, string> = {
    A1: '6-7',
    A2: '7-8',
    B1: '7-9',
    B2: '7-9',
    C1: '7-9',
    C2: '7-9',
  };

  const prompt = `Generate a German language learning story. Return ONLY valid JSON, no markdown.

Level: ${spec.level} (${levelGuidance[spec.level]})
Category: ${spec.category}
Topic: ${spec.topic}
Sentences: ${sentenceCount[spec.level]} total

JSON schema (follow exactly):
{
  "title": "English title (engaging, 5-10 words)",
  "sentences": [
    { "de": "German sentence.", "en": "English translation." }
  ],
  "vocabulary": [
    {
      "word": "German word",
      "article": "der|die|das (only for nouns, else omit this field)",
      "type": "noun|verb|adjective|adverb|conjunction|preposition|pronoun|expression",
      "level": "${spec.level}",
      "meaning": "English meaning"
    }
  ]
}

Rules:
- vocabulary: 5-7 words, pick the most useful/interesting ones from the story
- For nouns always include article field
- vocabulary "level" should reflect the actual CEFR level of that word (may differ from story level)
- sentences must be grammatically correct German
- translations must be natural English`;

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = response.content[0].type === 'text' ? response.content[0].text : '';

  // Strip any markdown fences
  const jsonText = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const parsed = JSON.parse(jsonText);

  const story = {
    id: String(id),
    slug,
    title: parsed.title,
    level: spec.level,
    category: spec.category,
    sentences: parsed.sentences,
    vocabulary: parsed.vocabulary,
  };

  fs.writeFileSync(
    path.join(STORIES_DIR, `${slug}.json`),
    JSON.stringify(story, null, 2)
  );
}

// ─── Concurrency limiter ──────────────────────────────────────────────────────

async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number
): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = [];
  let i = 0;

  async function worker() {
    while (i < tasks.length) {
      const taskIndex = i++;
      try {
        results[taskIndex] = { status: 'fulfilled', value: await tasks[taskIndex]() };
      } catch (e) {
        results[taskIndex] = { status: 'rejected', reason: e };
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Error: ANTHROPIC_API_KEY not set.');
    process.exit(1);
  }

  // Build task list — skip already-generated stories
  const pending: { spec: TopicSpec; slug: string }[] = [];
  const slugsSeen = new Set<string>();

  for (const spec of TOPICS) {
    let slug = slugify(spec.topic);
    // Deduplicate slugs
    let attempt = slug;
    let n = 2;
    while (slugsSeen.has(attempt)) {
      attempt = `${slug}-${n++}`;
    }
    slug = attempt;
    slugsSeen.add(slug);

    if (!storyExists(slug)) {
      pending.push({ spec, slug });
    }
  }

  console.log(`\n📚 EasyDeutsch story generator`);
  console.log(`   ${TOPICS.length} topics total`);
  console.log(`   ${TOPICS.length - pending.length} already generated (skipping)`);
  console.log(`   ${pending.length} to generate\n`);

  if (pending.length === 0) {
    console.log('✅ All stories already generated!');
    rebuildMeta();
    return;
  }

  let nextId = getNextId();

  // --test flag: generate just 1 story to verify API works
  if (process.argv.includes('--test')) {
    console.log('🧪 Test mode: generating 1 story...\n');
    try {
      const { spec, slug } = pending[0];
      await generateStory(spec, nextId, slug);
      console.log(`✅ Test passed! Generated: ${slug}`);
    } catch (e) {
      console.error('❌ Test failed:', e);
    }
    return;
  }
  let done = 0;
  let failed = 0;

  const tasks = pending.map(({ spec, slug }) => {
    const id = nextId++;
    return async () => {
      try {
        await generateStory(spec, id, slug);
        done++;
      } catch (e) {
        failed++;
        const msg = e instanceof Error ? e.message : String(e);
        if (failed <= 5) {
          console.error(`\n   ❌ ${slug}: ${msg}`);
        }
      }
      process.stdout.write(
        `\r   ${done + failed}/${pending.length} — ✓ ${done} generated, ✗ ${failed} failed   `
      );
    };
  });

  await runWithConcurrency(tasks, CONCURRENCY);

  console.log(`\n\n✅ Done. Rebuilding meta index...`);
  const total = rebuildMeta();
  console.log(`   stories-meta.json updated: ${total} stories total\n`);
}

main().catch((e) => {
  console.error('\n❌ Fatal error:', e);
  process.exit(1);
});
