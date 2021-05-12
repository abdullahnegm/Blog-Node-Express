import { useEffect, useState } from "react";
import image from "./image.jpg";
import Search from "./Search";

const Home = () => {
  const [posts, setPosts] = useState([]);

  //   const format = (data) => {
  //     setPosts(data.posts.results);
  //   };
  useEffect(() => {
    fetch("/posts/")
      .then((res) => {
        return res.json();
      })
      .then((data) => setPosts(data.posts.results));
  }, []);
  return (
    <>
      <div className="container mt-5">
        <Search />
        {posts.map((post, index) => {
          return (
            <div key={index} className="card mb-3">
              <img
                className="card-img-top"
                src={post.image ? `/posts/image/${post._id}` : image}
                alt="Card image cap"
                height="300"
              />
              <div className="card-body">
                <h5 className="card-title">
                  <a href={"/post/" + post._id}>{post.title}</a>
                </h5>
                <p className="card-text">{post.body}</p>
                <p className="card-text">
                  <small className="text-muted">{post.createdAt}</small>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Home;
