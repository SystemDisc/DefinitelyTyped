import { compile, serialize, stringify, middleware, DECLARATION, LAYER, MEDIA } from 'stylis';

const styles = `
  .class {
    margin-top: 5px;
  }
`;

// $ExpectType "@layer"
LAYER;
// $ExpectType "@media"
MEDIA;

// $ExpectType Element[]
const AST = compile(styles);
// $ExpectType Element | null
AST[0].parent;
// $ExpectType string | Element[]
AST[0].children;
// $ExpectType Element | null
AST[0].root;
// $ExpectType number
AST[0].line;
// $ExpectType number
AST[0].column;

// $ExpectType string
const A = serialize(compile(styles), stringify);

const assert = (bool: boolean): void => { if (bool) return; throw new Error(); };

// Traversal example
const B = serialize(
    compile('h1{all:unset}'),
    middleware([
        (element, index, children) => {
            if (element.root === null) return;
            assert(children === element.root.children && children[index] === element);
        },
        stringify,
    ]),
);
assert(B === 'h1{all:unset;}');

// Prefixing example
const C = serialize(
  compile('h1{all:unset}'),
  middleware([
    (element, index, children, callback) => {
      if (element.type === DECLARATION && element.props === 'all' && element.children === 'unset')
        element.return = 'color:red;' + element.value;
    },
    stringify
  ])
);
assert(C === 'h1{color:red;all:unset;}');

const D = serialize(
  compile('h1{all:unset}'),
  middleware([
    (element, index, children, callback) => {
      if (element.type === 'rule' && element.props.indexOf('h1') > -1)
        return serialize([{...element, props: ['h2', 'h3']}], callback);
    },
    stringify
  ])
);
assert(D === 'h2,h3{all:unset;}h1{all:unset;}');

// Reading example
const E = serialize(
  compile('h1{all:unset}'),
  middleware([
    stringify,
    (element, index, children) => {
      assert(element.return === 'h1{all:unset;}');
    }
  ])
);
assert(E === 'h1{all:unset;color:red;}');
