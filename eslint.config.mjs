import globals from 'globals';
export default [{
  files:['src/**/*.js','admin/**/*.js','online/**/*.js','api/**/*.js','server/**/*.mjs','scripts/**/*.mjs','tests/**/*.js','tests/**/*.mjs'],
  languageOptions:{ecmaVersion:'latest',sourceType:'module',globals:{...globals.browser,...globals.node}},
  rules:{'no-undef':'error','no-unreachable':'error','no-dupe-args':'error','no-dupe-keys':'error','valid-typeof':'error'},
}];
