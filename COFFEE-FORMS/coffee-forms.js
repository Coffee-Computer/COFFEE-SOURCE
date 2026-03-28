/**
 * coffee.form() — Form wrapper with validation and submit handling.
 * Load after coffee-ui (uses coffee.input, coffee.label, coffee.button).
 *
 * coffee.form({ fields, onSubmit, validate, submitLabel })
 *
 * fields: [{ name, type, label, required, placeholder, value }]
 * validate: (data) => errors or null
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  coffee.form = function (opts = {}) {
    const { fields = [], onSubmit, validate, submitLabel = 'Submit' } = opts;

    const form = document.createElement('form');
    form.setAttribute('data-coffee', 'form');
    form.style.cssText = 'display:flex;flex-direction:column;gap:var(--coffee-space-md,16px);max-width:400px';

    const inputs = {};
    const errorEls = {};

    fields.forEach((f) => {
      const { name, type = 'text', label, required, placeholder, value } = f;
      const id = 'form-' + name;

      if (label && coffee.label) {
        const lab = coffee.label(label, id);
        form.appendChild(lab);
      }

      let inp;
      const fullWidth = { style: { width: '100%' } };
      if (type === 'textarea') {
        inp = coffee.textarea ? coffee.textarea({ placeholder, value, id, ...fullWidth }) : (() => {
          const i = document.createElement('textarea');
          i.id = id;
          i.placeholder = placeholder || '';
          if (value != null) i.value = value;
          i.style.cssText = 'padding:8px 12px;border:1px solid #666;border-radius:8px;background:#252525;color:#eee;width:100%;min-height:80px';
          return i;
        })();
      } else {
        inp = coffee.input ? coffee.input({ type, placeholder, value, id, ...fullWidth }) : (() => {
          const i = document.createElement('input');
          i.type = type;
          i.id = id;
          i.placeholder = placeholder || '';
          if (value != null) i.value = value;
          i.style.cssText = 'padding:8px 12px;border:1px solid #666;border-radius:8px;background:#252525;color:#eee;width:100%';
          return i;
        })();
      }

      if (required) inp.required = true;
      inp.name = name;
      inputs[name] = inp;
      form.appendChild(inp);

      const err = document.createElement('div');
      err.style.cssText = 'font-size:12px;color:#ef4444;min-height:16px';
      err.className = 'form-error';
      errorEls[name] = err;
      form.appendChild(err);
    });

    const submitBtn = coffee.button ? coffee.button(submitLabel, null) : (() => {
      const b = document.createElement('button');
      b.type = 'submit';
      b.textContent = submitLabel;
      b.style.cssText = 'padding:10px 20px;background:#4c9aff;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600';
      return b;
    })();
    submitBtn.type = 'submit';
    form.appendChild(submitBtn);

    function getData() {
      const data = {};
      Object.keys(inputs).forEach((name) => {
        const inp = inputs[name];
        const val = inp.value;
        data[name] = inp.type === 'number' ? (val ? Number(val) : null) : val;
      });
      return data;
    }

    function setErrors(errors) {
      Object.keys(errorEls).forEach((name) => {
        errorEls[name].textContent = errors && errors[name] ? errors[name] : '';
      });
    }

    form.onsubmit = (e) => {
      e.preventDefault();
      setErrors(null);

      const data = getData();

      if (validate) {
        const errors = validate(data);
        if (errors && Object.keys(errors).length > 0) {
          setErrors(errors);
          return;
        }
      }

      onSubmit && onSubmit(data);
    };

    form.getData = getData;
    form.setErrors = setErrors;

    return form;
  };

  window.coffee = coffee;
})();
