const crsterHtml = require("./index.js");

const view = `
<view {layout}>
<block {style}>
  <style>
    .blue {
      color: blue;
    }
  </style>
</block>

<block {script}>
  <script>
    let counter = 0;
    function addCounter() {
      setValue(counter++);
    }
  </script>
</block>

<block {body}>
  <p class="blue">{counter} {users.length}</p>

  <switch {!!counter}>
      <case {true}>
          <p>click button to start</p>
      </case>
      <case {false}>
        <p>continue clicking</p>
      </case>
  </switch>

  <for {user of users}>
      <p>{user.name}</p>
     <for {ads of user.addresses}>
       <p>{ads.title}</p>
     </for>
  </for>

  <button onclick="addCounter()">Click Me!</button>
</block>
</view>`;

const args = {
  counter: 0,
  users: [
    { name: "Amiel", addresses: [{ title: "Aplaya" }, { title: "Digos" }] },
    { name: "Hussien", addresses: [{ title: "Aplaya" }] },
    {
      name: "Apiag",
      addresses: [{ title: "Cebu" }, { title: "Mactan" }, { title: "Leyte" }],
    },
    { name: "Dagadas", addresses: [] },
  ],
};

const res = crsterHtml.render(view, args);

console.log(res);
