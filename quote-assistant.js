(() => {
  const assistant = document.querySelector('[data-quote-assistant]');
  if (!assistant) return;

  const toggle = assistant.querySelector('[data-assistant-toggle]');
  const panel = assistant.querySelector('[data-assistant-panel]');
  const closeButton = assistant.querySelector('[data-assistant-close]');
  const status = assistant.querySelector('[data-assistant-status]');
  const progressContext = assistant.querySelector('[data-assistant-progress-context]');
  const progress = assistant.querySelector('[data-assistant-progress]');
  const progressFill = assistant.querySelector('[data-assistant-progress-fill]');
  const form = assistant.querySelector('[data-assistant-form]');
  const fieldset = assistant.querySelector('[data-assistant-fieldset]');
  const question = assistant.querySelector('[data-assistant-question]');
  const hint = assistant.querySelector('[data-assistant-hint]');
  const options = assistant.querySelector('[data-assistant-options]');
  const review = assistant.querySelector('[data-assistant-review]');
  const reviewHeading = assistant.querySelector('[data-assistant-review-heading]');
  const summary = assistant.querySelector('[data-assistant-summary]');
  const stepActions = assistant.querySelector('[data-assistant-step-actions]');
  const backButton = assistant.querySelector('[data-assistant-back]');
  const nextButton = assistant.querySelector('[data-assistant-next]');
  const reviewActions = assistant.querySelector('[data-assistant-review-actions]');
  const details = assistant.querySelector('[data-assistant-details]');
  const characterCount = assistant.querySelector('[data-assistant-count]');
  const whatsappLink = assistant.querySelector('[data-assistant-whatsapp]');
  const resetButton = assistant.querySelector('[data-assistant-reset]');

  if ([toggle, panel, closeButton, status, progressContext, progress, progressFill, form, fieldset, question, hint, options, review, reviewHeading, summary, stepActions, backButton, nextButton, reviewActions, details, characterCount, whatsappLink, resetButton].some(element => !element)) return;

  const steps = [
    {
      question: '¿Qué quieres cotizar?',
      hint: 'Selecciona el tipo de proyecto.',
      summaryLabel: 'Proyecto',
      options: [
        'Landing page',
        'Sitio web para mi negocio',
        'Tienda online',
        'Fotografía comercial',
        'Proyecto personalizado o necesito orientación'
      ]
    },
    {
      question: '¿A qué se dedica tu negocio?',
      hint: 'Elige el sector que mejor lo describe.',
      summaryLabel: 'Tipo de negocio',
      options: [
        'Comercio, moda o joyería',
        'Gastronomía y alimentos',
        'Servicios profesionales',
        'Propiedades u hospedaje',
        'Otro tipo de negocio'
      ]
    },
    {
      question: '¿Qué te gustaría lograr?',
      hint: 'Marca la prioridad principal para tu proyecto.',
      summaryLabel: 'Objetivo',
      options: [
        'Presentar mis servicios y recibir consultas',
        'Vender productos o recibir pedidos',
        'Conseguir reservas o citas',
        'Crear fotos para web, catálogo o redes',
        'Mejorar mi presencia digital'
      ]
    }
  ];

  const answers = Array(steps.length).fill('');
  let currentStep = 0;
  let isReviewing = false;

  function setProgress(label, context, value) {
    status.textContent = label;
    progressContext.textContent = context;
    progress.setAttribute('aria-valuenow', String(value));
    progress.setAttribute('aria-valuetext', label);
    progressFill.style.width = `${(value / steps.length) * 100}%`;
  }

  function renderQuestion(shouldFocus = false) {
    isReviewing = false;
    fieldset.hidden = false;
    review.hidden = true;
    stepActions.hidden = false;
    reviewActions.hidden = true;

    const step = steps[currentStep];
    question.textContent = step.question;
    hint.textContent = step.hint;
    setProgress(`Pregunta ${currentStep + 1} de ${steps.length}`, 'Elige una opción para continuar', currentStep + 1);
    backButton.hidden = currentStep === 0;
    nextButton.textContent = currentStep === steps.length - 1 ? 'Ver consulta' : 'Continuar';
    nextButton.disabled = !answers[currentStep];

    options.replaceChildren(...step.options.map((answer, index) => {
      const label = document.createElement('label');
      const input = document.createElement('input');
      const text = document.createElement('span');
      const id = `quote-assistant-option-${currentStep}-${index}`;

      label.className = 'quote-assistant-choice';
      input.type = 'radio';
      input.name = `quote-assistant-step-${currentStep}`;
      input.id = id;
      input.value = answer;
      input.checked = answers[currentStep] === answer;
      if (input.checked) label.classList.add('is-selected');
      text.textContent = answer;
      label.htmlFor = id;
      input.addEventListener('change', () => {
        answers[currentStep] = answer;
        options.querySelectorAll('.quote-assistant-choice').forEach(choice => choice.classList.remove('is-selected'));
        label.classList.add('is-selected');
        nextButton.disabled = false;
      });
      label.append(input, text);
      return label;
    }));

    if (shouldFocus) question.focus({ preventScroll: true });
  }

  function buildMessage() {
    const lines = [
      'Hola, vi mipaginacr.com y quiero hacer una consulta sobre mi proyecto.',
      `${steps[0].summaryLabel}: ${answers[0]}`,
      `${steps[1].summaryLabel}: ${answers[1]}`,
      `${steps[2].summaryLabel}: ${answers[2]}`
    ];
    const extra = details.value.trim();
    if (extra) lines.push(`Detalle: ${extra}`);
    return lines.join('\n');
  }

  function updateWhatsAppLink() {
    whatsappLink.href = `https://wa.me/50660072890?text=${encodeURIComponent(buildMessage())}`;
  }

  function renderReview(shouldFocus = false) {
    isReviewing = true;
    fieldset.hidden = true;
    review.hidden = false;
    stepActions.hidden = true;
    reviewActions.hidden = false;
    setProgress('Resumen de la consulta', 'Puedes editar tus respuestas', steps.length);
    summary.replaceChildren(...steps.map((step, index) => {
      const row = document.createElement('div');
      const content = document.createElement('div');
      const term = document.createElement('dt');
      const definition = document.createElement('dd');
      const editButton = document.createElement('button');

      row.className = 'quote-assistant-summary-row';
      term.textContent = step.summaryLabel;
      definition.textContent = answers[index];
      editButton.className = 'quote-assistant-edit';
      editButton.type = 'button';
      editButton.dataset.editStep = String(index);
      editButton.setAttribute('aria-label', `Editar respuesta: ${step.summaryLabel}`);
      editButton.textContent = 'Editar';
      content.append(term, definition);
      row.append(content, editButton);
      return row;
    }));

    characterCount.textContent = String(details.value.length);
    updateWhatsAppLink();
    if (shouldFocus) reviewHeading.focus({ preventScroll: true });
  }

  function advance() {
    if (!answers[currentStep]) return;
    if (currentStep < steps.length - 1) {
      currentStep += 1;
      renderQuestion(true);
      return;
    }
    renderReview(true);
  }

  function openAssistant() {
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => {
      if (isReviewing) reviewHeading.focus({ preventScroll: true });
      else question.focus({ preventScroll: true });
    });
  }

  function closeAssistant(restoreFocus = true) {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    if (restoreFocus) toggle.focus({ preventScroll: true });
  }

  toggle.addEventListener('click', () => {
    if (panel.hidden) openAssistant();
    else closeAssistant();
  });
  closeButton.addEventListener('click', () => closeAssistant());
  backButton.addEventListener('click', () => {
    if (currentStep === 0) return;
    currentStep -= 1;
    renderQuestion(true);
  });
  nextButton.addEventListener('click', advance);
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!isReviewing) advance();
  });
  summary.addEventListener('click', event => {
    const editButton = event.target.closest('[data-edit-step]');
    if (!editButton) return;
    currentStep = Number(editButton.dataset.editStep);
    renderQuestion(true);
  });
  details.addEventListener('input', () => {
    characterCount.textContent = String(details.value.length);
    updateWhatsAppLink();
  });
  resetButton.addEventListener('click', () => {
    answers.fill('');
    details.value = '';
    currentStep = 0;
    renderQuestion(true);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) {
      event.preventDefault();
      closeAssistant();
    }
  });

  renderQuestion();
  assistant.hidden = false;
})();
