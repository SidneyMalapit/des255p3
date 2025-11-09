// in process of getting positions of checked inputs' positions

export enum QuestionType {
  FreeResponse,
  SingleChoice,
  MultipleChoice
}

export abstract class Question {
  private static count = 0;
  protected static inputCount = 0;

  protected _response: { content: unknown, ids: number[] } = { content: null, ids: [] };

  get response() { return this._response; }

  readonly id: number;

  constructor(readonly prompt: string) { this.id = Question.count++; }

  get toHTML() {
    const root = document.createElement('section');
    root.classList.add('question');
    const prompt = document.createElement('p');
    prompt.classList.add('prompt');
    prompt.innerText = this.prompt;
    root.append(prompt);
    return root;
  }

  protected createInput() {
    const input = document.createElement('input');
    input.id = `response-${++Question.inputCount}`;
    return input;
  }
}

export class FreeResponseQuestion extends Question {
  constructor(...args: ConstructorParameters<typeof Question>) {
    super(...args);
    this._response.content = '';
  }

  override get toHTML() {
    const root = super.toHTML;
    const input = this.createInput();
    input.type = 'text';
    input.name = 'response';
    input.maxLength = 18;
    input.addEventListener<'input'>('input', ({ target }) => {
      if (!(target instanceof HTMLInputElement)) { return; }
      this._response = { content: target.value, ids: [+input.id.slice(9)] };
    });
    root.append(input);
    return root;
  }
}

export class SingleChoiceQuestion extends Question {
  constructor(prompt: string, readonly choices: string[]) {
    super(prompt);
    this._response.content = '';
  }

  override get toHTML() {
    const root = super.toHTML;
    const form = document.createElement('form');
    form.classList.add('input-container');

    for (const choice of this.choices) {
      const container = document.createElement('span');
      container.classList.add('aligner');

      const input = this.createInput();
      input.name = 'response';
      input.type = 'radio';
      input.value = choice;

      const label = document.createElement('label');
      label.innerText = choice;
      label.setAttribute('for', `response-${Question.inputCount}`);

      container.append(input, label);
      form.append(container);
    }

    form.addEventListener('change', ({ target }) => {
      if (!(target instanceof HTMLInputElement)) { return; }
      this._response = { content: target.value, ids: [+target.id.slice(9)] };
    });
    root.append(form);

		return root;
  }
}

export class MultipleChoiceQuestion extends Question {
  protected override _response = { content: new Set<string>, ids: [] as number[] };

  constructor(prompt: string, readonly choices: string[]) { super(prompt); }

  override get toHTML() {
    const root = super.toHTML;
    const form = document.createElement('form');
    form.classList.add('input-container');

    for (const choice of this.choices) {
      const container = document.createElement('span');
      container.classList.add('aligner');

      const input = this.createInput();
      input.name = 'response';
      input.type = 'checkbox';
      input.value = choice;

      const label = document.createElement('label');
      label.innerText = choice;
      label.setAttribute('for', `response-${Question.inputCount}`);

      container.append(input, label);
      form.append(container);
    }

    form.addEventListener('change', ({ target }) => {
      if (!(target instanceof HTMLInputElement)) { return; }
      this._response.content[target.checked ? 'add' : 'delete'](target.value);
      if (target.checked) {
        this._response.ids.push(+target.id.slice(9));
      } else {
        this._response.ids.splice(this._response.ids.indexOf(+target.id.slice(9)), 1);
      }
      console.log(this._response);
    });

    root.append(form);

    return root;
  }
}
