import {createElement,Wrapper,Text,} from './createElement'

class Carousel {
  constructor () {
      this.children = [];
      this.attributes = new Map();
      this.properties = new Map();
  }

  setAttribute (name, value) {
      this.attributes.set(name, value);
      this[name] = value;
  }

  appendChild (child) {   // children
      this.children.push(child);
  }

  mountTo (parent) {
      this.render().mountTo(parent);
  }

  render () {
      let children = this.attributes.get('data').map(url => {
          let element = <img src={url} />
          element.addEventListener('dragstart', event => event.preventDefault());
          return element;
      });

      let root = <div class={this.attributes.get('class')}>
          {children}
      </div>;

      let position = 0,timer;

      let nextPic = () => {
          let nextPosition =  (position + 1) % this.data.length;

          let current = children[position];
          let next = children[nextPosition];

          current.style.transition = "ease 0s";
          next.style.transition = "ease 0s";

          current.style.transform = `translateX(${-100 * position}%)`;
          next.style.transform = `translateX(${100 - 100 * nextPosition}%)`;

          setTimeout(() => {
            current.style.transition = "";
            next.style.transition = "";

            current.style.transform = `translateX(${-100 - 100 * position}%)`;
            next.style.transform = `translateX(${-100 * nextPosition}%)`;

            position = nextPosition;
            timer = setTimeout(nextPic, 3000);
          }, 16);
      }

      root.addEventListener('mousedown', event => {
          let startX = event.clientX
          
          let nextPosition = (position + 1) % this.data.length;
          let lastPosition =
            (position - 1 + this.data.length) % this.data.length;

          let current = children[position];
          let last = children[lastPosition];
          let next = children[nextPosition];

          current.style.transition = "ease 0s";
          next.style.transition = "ease 0s";
          last.style.transition = "ease 0s";

          current.style.transform = `translateX(${-500 * position}px)`;
          last.style.transform = `translateX(${-500-500 * lastPosition}px)`;
          next.style.transform = `translateX(${500-500 * nextPosition}px)`;
              
          let move = (e) => {
            current.style.transform = `translateX(${
              e.clientX - startX - 500 * position
            }px)`;
            next.style.transform = `translateX(${
              e.clientX - startX - 500 - 500 * nextPosition
            }px)`;
            last.style.transform = `translateX(${
              e.clientX - startX + 500 - 500 * lastPosition
            }px)`;
          };
          let up = (e) => {
            let offset = 0;
            if (e.clientX - startX > 100) {
              offset = 1;
            } else if (e.clientX - startX < -100) {
              offset = -1;
            }

            current.style.transition = "ease 0.2s";
            next.style.transition = "ease 0.2s";
            last.style.transition = "ease 0.2s";

            current.style.transform = `translateX(${
              offset * 500 - 500 * position
            }px)`;
            next.style.transform = `translateX(${
              offset * 500 - 500 - 500 * nextPosition
            }px)`;
            last.style.transform = `translateX(${
              offset * 500 + 500 - 500 * lastPosition
            }px)`;

            position =
              (position + offset + this.data.length) % this.data.length;

            document.removeEventListener("mousemove", move);
            document.removeEventListener("mouseup", up);
          };
          document.addEventListener("mousemove", move);
          document.addEventListener("mouseup", up);
      });

      root.addEventListener("mouseover", (e) => {
        console.log("我进来啦");
        clearTimeout(timer);
      });

      root.addEventListener("mouseleave", (e) => {
        console.log("我出去啦");
        timer = setTimeout(() => {
          clearTimeout(timer);
          nextPic();
        }, 1000);
      });
      
      nextPic()

      return root;
  }
}

let component = <Carousel class="carousel" data={[
  "https://static001.geekbang.org/resource/image/bb/21/bb38fb7c1073eaee1755f81131f11d21.jpg",
  "https://static001.geekbang.org/resource/image/1b/21/1b809d9a2bdf3ecc481322d7c9223c21.jpg",
  "https://static001.geekbang.org/resource/image/b6/4f/b6d65b2f12646a9fd6b8cb2b020d754f.jpg",
  "https://static001.geekbang.org/resource/image/73/e4/730ea9c393def7975deceb48b3eb6fe4.jpg",
]} />

component.mountTo(document.body);




