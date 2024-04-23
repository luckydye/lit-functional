# lit-functional

A functional way of defineing custom elements using lit-html

```js
createComponent("test-counter", (props) => {
  props.count = 0;

  return () => html`
    <div>
      <button @click=${() => props.count++}>count ${props.count}</button>
      <button @click=${() => (props.count = 0)}>reset</button>
    </div>
  `;
});
```
