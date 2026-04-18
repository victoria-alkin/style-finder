export interface Store {
  name: string;
  domain: string;
  category: string;
}

export const STORES: Store[] = [
  { name: 'Mac Duggal', domain: 'macduggal.com', category: 'Formal & Prom' },
  { name: 'Adrianna Papell', domain: 'adriannapapell.com', category: 'Formal' },
  { name: 'Fashion Nova', domain: 'fashionnova.com', category: 'Trendy' },
  { name: 'Meshki', domain: 'meshki.us', category: 'Bodycon' },
  { name: 'Oh Polly', domain: 'ohpolly.com', category: 'Occasion' },
  { name: 'Princess Polly', domain: 'us.princesspolly.com', category: 'Casual' },
  { name: 'Windsor', domain: 'windsorstore.com', category: 'Formal & Prom' },
  { name: 'Showpo', domain: 'showpo.com', category: 'Party' },
  { name: 'Bec + Bridge', domain: 'becandbridge.com', category: 'Luxury Casual' },
  { name: 'Lioness', domain: 'lionessfashion.com', category: 'Going Out' },
];
