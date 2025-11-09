//import './style.css';
import {
  Question,
  FreeResponseQuestion,
  SingleChoiceQuestion,
  MultipleChoiceQuestion
} from './questions';
import info from './welcome';

const app = document.querySelector('#app')!;

const questions: Question[] = [];

const params = new URLSearchParams(location.search);
const gen = sfc32(...cyrb128(params.get('seed') ?? 'sneedsfeednseed'));

const url = `https://discord.com/api/webhooks/1436661770486812774/uWZ-qLqFz-kkpL-1cABI5l8p8cb2Zn81I0VlrzSk1cOU6inSZNOHVTA5kIfWARKJG4YE`;

const words = (await fetch('/common_words.txt').then((res) => res.text())).split('\r\n').filter((word) => word.length < 10);
console.log(words);

for (let i = 0; i < 85; i++) {
  const prob = gen();

  const prompt = genRandomPhrase(gen, scale(gen(), 100, true) * 7 + 1);
  const responses = Array.from(
    { length: Math.floor(scale(gen(), 300, true) * 6 + 2) },
    () => genRandomPhrase(gen, scale(gen(), 100, true) * 7 + 1)
  );

  let question: Question;
  if (prob < 1/5) {
    question = new FreeResponseQuestion(prompt);
  } else if (prob < 3/5) {
    question = new SingleChoiceQuestion(prompt, responses);
  } else {
    question = new MultipleChoiceQuestion(prompt, responses);
  }

  questions.push(question);
  app.append(question.toHTML);
  
  //await new Promise((resolve) => setTimeout(resolve, 100));
}

const submitButton = document.querySelector<HTMLButtonElement>('#get-results')!;
submitButton.addEventListener('click', () => {
  const data = {
    responses: questions
    .map(({ response }) => {
      const temp = { ...response };
      if (response.content instanceof Set) {
        temp.content = Array.from(response.content);
      }
      return temp;
    }).filter(({ ids }) => ids.length > 0),
    id: info.identity
  };

  console.log(data);

  submitButton.disabled = true;
  submitButton.innerText = 'your responses were received! thank you!';

  submit(url, data);
});

// Source - https://stackoverflow.com/a
// Posted by bryc, modified by community. See post 'Timeline' for change history
// Retrieved 2025-11-07, License - CC BY-SA 4.0

function cyrb128(str: string): [number, number, number, number] {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
    return [h1>>>0, h2>>>0, h3>>>0, h4>>>0];
}
// Side note: Only designed & tested for seed generation,
// may be suboptimal as a general 128-bit hash.

// Source - https://stackoverflow.com/a
// Posted by bryc, modified by community. See post 'Timeline' for change history
// Retrieved 2025-11-07, License - CC BY-SA 4.0

function sfc32(a: number, b: number, c: number, d: number) {
  return function() {
    a |= 0; b |= 0; c |= 0; d |= 0;
    let t = (a + b | 0) + d | 0;
    d = d + 1 | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  }
}

function genRandomPhrase(generator: () => number, count: number) {
  let prompt = '';
  for (let i = 0; i < count; i++) {
    prompt += words[Math.floor(generator() * words.length)] + ' ';
  }
  return prompt.slice(0, -1);
}

function scale(n: number, curve: number, negative = false) {
  return +negative + (negative ? -1 : 1) * Math.log(curve * n + 1) / Math.log(curve + 1);
}

function submit(url: string, data: any) {
  const formData = new FormData;
  formData.append('payload_json', JSON.stringify({
    content: `received a new submission from '${data.id ?? 'unknown'}'`
  }));
  formData.append('files[0]', new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), 'data.json');

  return fetch(url, {
    method: 'POST',
    body: formData
  });
}

export function getCenter(element: HTMLElement) {
  return {
    left: element.offsetLeft + element.offsetWidth / 2,
    top: element.offsetTop + element.offsetHeight / 2,
  }
}
