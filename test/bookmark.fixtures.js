function makeBookmarkArray() {
  return [
    {
      id: 1,
      title: 'Test 1',
      url: 'https://www.testing1.com',
      description: 'I am a test description',
      rating: 1
    },
    {
      id: 2,
      title: 'Test 2',
      url: 'https://www.testing2.com',
      description: 'I am a test description',
      rating: 2
    },
    {
      id: 3,
      title: 'Test 3',
      url: 'https://www.testing3.com',
      description: 'I am a test description',
      rating: 3
    },
    {
      id: 4,
      title: 'Test 4',
      url: 'https://www.testing4.com',
      description: 'I am a test description',
      rating: 4
    }
  ];
}

module.exports = { makeBookmarkArray };