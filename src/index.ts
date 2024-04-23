import { html, createComponent, onUnmounted, onMounted, useAttribute } from "./comp.js";

interface TestProps {
  test: string;
  open: boolean;
}

createComponent("a-test", (props: TestProps) => {
  // property hook to reflect to attribute
  useAttribute("open");

  // default prop value
  props.open = true;

  // event handler
  const onClick = () => {
    props.open = !props.open;
  };

  return (children) => html`
    <div class="p-4">
      <h1 @click=${onClick}>Comp ${props.test}</h1>
      <div ?hidden=${!props.open}>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam voluptatum,
          voluptatibus, quibusdam, quia voluptatem quos exercitationem voluptate quod quas
          quidem dolorum. Quisquam voluptatum, voluptatibus, quibusdam, quia voluptatem
          quos exercitationem voluptate quod quas quidem dolorum.
        </p>
        ${children}
      </div>
    </div>
  `;
});

createComponent("a-test2", (props: any) => {
  props.count = 0;

  return () => html`
    <div>
      <button @click=${() => props.count++}>count ${props.count}</button>
      <button @click=${() => (props.count = 0)}>reset</button>
    </div>
  `;
});
