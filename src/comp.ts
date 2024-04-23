import { TemplateResult, html, render } from "lit-html";

export { html };

type Context = {
  node: HTMLElement | null;
  attributes: (string | symbol)[];
  styles: string[];
  hooks: {
    unmounted: (() => void)[];
    mounted: ((element: HTMLElement) => void)[];
  };
  children: Element[];
};

let currentContext: Context | null = null;

export function onUnmounted(cb: () => void) {
  if (!currentContext) {
    console.error("onUnmounted must be called inside a component");
    return;
  }

  currentContext.hooks.unmounted.push(cb);
}

export function onMounted(cb: (element: HTMLElement) => void) {
  if (!currentContext) {
    console.error("onMounted must be called inside a component");
    return;
  }

  currentContext.hooks.mounted.push(cb);
}

export function useAttribute(attribute: string) {
  if (!currentContext) {
    console.error("useAttribute must be called inside a component");
    return;
  }

  currentContext.attributes.push(attribute);
}

export function useStyles(styles: string[]) {
  if (!currentContext) {
    console.error("useStyles must be called inside a component");
    return;
  }

  currentContext.attributes.push(...styles);
}

function getProps(node, props) {
  const propNames = node.getAttributeNames();
  propNames.forEach((name) => {
    props[name] = node.getAttribute(name);
  });
  for (const prop in props) {
    if (!propNames.includes(prop)) {
      props[prop] = undefined;
    }
  }
}

export function createComponent(
  tag: string,
  component: (props: any) => (children: Element[]) => TemplateResult
) {
  const _props = new Map<string | symbol, any>();
  const _renderedProps: (string | symbol)[] = [];

  const context: Context = {
    node: null,
    attributes: [],
    styles: [],
    hooks: {
      unmounted: [],
      mounted: [],
    },
    children: [],
  };

  const props = new Proxy(_props, {
    set(target, prop, value) {
      target.set(prop, value);

      if (context.node) {
        // @ts-ignore
        context.node.update();
        reflectProps(context.node);
      }
      return true;
    },
    get(target, key) {
      _renderedProps.push(key);
      return target.get(key);
    },
  });

  function reflectProps(node) {
    for (const [prop] of _props) {
      if (!context.attributes.includes(prop)) continue;

      const value = _props.get(prop);

      if (typeof value == "boolean") {
        if (value) {
          node.setAttribute(prop, "");
        } else {
          node.removeAttribute(prop);
        }
        continue;
      }

      if (_props.get(prop) === undefined) {
        node.removeAttribute(prop);
      } else {
        node.setAttribute(prop, _props.get(prop));
      }
    }
  }

  currentContext = context;
  const _render = component(props);
  currentContext = null;

  const element = class extends HTMLElement {
    _inited = false;

    static get observedAttributes() {
      return context.attributes;
    }

    attributeChangedCallback(attributeName, oldValue, newValue) {
      if (_renderedProps.includes(attributeName)) {
        this.update();
      }
    }

    connectedCallback() {
      if (!this._inited) {
        this._inited = true;
        context.node = this;
        context.children = [...this.children];
        getProps(this, props);
      }

      this.update();

      context.hooks.mounted.forEach((cb) => cb(this));
    }

    disconnectedCallback() {
      context.hooks.unmounted.forEach((cb) => cb());
    }

    update() {
      render(_render(context.children), this);
    }
  };

  if (!customElements.get(tag)) customElements.define(tag, element);
}
