<template>
  <div style="width: 500px; height: 300px;">
    <img
      style="width: 500px; height: 300px;"
      src="https://static001.geekbang.org/resource/image/73/e4/730ea9c393def7975deceb48b3eb6fe4.jpg"
    />
  </div>
</template>
<script>
export default {
  el: "#example",
  data: {
    message: "Hello",
  },
  computed: {
    reversedMessage: function () {
      let i = 1;
      while (i < 100) {
        i++;
      }
      return this.message.split("").reverse().join("");
    },
  },
};
</script>
