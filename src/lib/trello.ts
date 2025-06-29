import axios from 'axios';

const API_KEY = process.env.TRELLO_API_KEY;
const TOKEN = process.env.TRELLO_TOKEN;
const LIST_ID = process.env.TRELLO_CONFIRMED_LIST_ID;

type TrelloCardInput = {
  artist: string;
  venue: string;
  date: string;
  description?: string;
};

export async function createTrelloCard({ artist, venue, date, description }: TrelloCardInput) {
  const title = `${artist} @ ${venue} - ${new Date(date).toLocaleDateString()}`;

  return axios.post('https://api.trello.com/1/cards', null, {
    params: {
      key: API_KEY,
      token: TOKEN,
      idList: LIST_ID,
      name: title,
      desc: description || '',
      due: date,
      pos: 'top',
    },
  });
}
