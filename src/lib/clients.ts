export interface Client {
  id: string;
  name: string;
  logoUrl: string;
  projectImageUrl: string;
  order: number;
  published: boolean;
}

export const defaultClients: Client[] = [
  {
    id: "c1",
    name: "Aarti K. — Café owner",
    logoUrl: "https://i.pinimg.com/736x/cf/02/0f/cf020fc96716b03d1e264dc7b2709375.jpg",
    projectImageUrl: "https://i.pinimg.com/736x/02/d6/13/02d613abceb7a001e690272b9c852768.jpg",
    order: 1,
    published: true,
  },
  {
    id: "c2",
    name: "The Heritage Café",
    logoUrl: "https://i.pinimg.com/736x/cf/02/0f/cf020fc96716b03d1e264dc7b2709375.jpg",
    projectImageUrl: "https://i.pinimg.com/736x/06/1c/1e/061c1e5ab8bb7b74a65ce7b2f1981ab2.jpg",
    order: 2,
    published: true,
  },
  {
    id: "c3",
    name: "Private Residence",
    logoUrl: "https://i.pinimg.com/736x/cf/02/0f/cf020fc96716b03d1e264dc7b2709375.jpg",
    projectImageUrl: "https://i.pinimg.com/736x/63/6c/a3/636ca320b14be7718a311ca9cc148bab.jpg",
    order: 3,
    published: true,
  },
];
