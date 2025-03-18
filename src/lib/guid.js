console.log(
  Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16))
    .join("")
    .toUpperCase(),
);
