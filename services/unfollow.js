function unfollow(follows, id) {
  let post_unfollow = follows.filter((follower) => follower != id);
  return post_unfollow;
}

module.exports = unfollow;
