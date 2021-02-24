require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const albums = require('../data/albums');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;

    beforeAll(async done => {
      execSync('npm run setup-db');

      client.connect();

      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });

      token = signInData.body.token; // eslint-disable-line

      return done();
    });

    afterAll(done => {
      return client.end(done);
    });

    test('returns all albums', async () => {

      const expectation = [
        // {
        //   'id': 9,
        //   'name': 'bread',
        //   'description': 'best of',
        //   'genre_id': 1,
        //   'genre': 'sixties/psych',
        //   'price': 0,
        //   'instock': false,
        //   'owner_id': 1
        // },
        {
          'id': 7,
          'name': 'WITCH: Lazy Bones',
          'description': 'One of the defining albums from the zam-rock movement',
          'genre_id': 1,
          'genre': 'sixties/psych',
          'price': 21,
          'instock': true,
          'owner_id': 1
        },
        {
          'id': 4,
          'name': 'Beach Boys: Pet Sounds',
          'description': 'Maybe the best record ever recorded?',
          'genre_id': 1,
          'genre': 'sixties/psych',
          'price': 21,
          'instock': false,
          'owner_id': 1
        },
        {
          'id': 2,
          'name': 'Os Mutantes: s/t',
          'description': 'the debut eponymous album by the Brazilian tropicalia band Os Mutantes',
          'genre_id': 1,
          'genre': 'sixties/psych',
          'price': 18,
          'instock': true,
          'owner_id': 1
        },
        {
          'id': 8,
          'name': 'The Cure: The Head On The Door',
          'description': 'the first glimpse of the Cure as a pop band',
          'genre_id': 2,
          'genre': '80s bangers',
          'price': 18,
          'instock': true,
          'owner_id': 1
        },
        {
          'id': 3,
          'name': 'Kate Bush: Hounds Of Love',
          'description': 'the fifth studio album by English singer-songwriter and musician Kate Bush',
          'genre_id': 2,
          'genre': '80s bangers',
          'price': 22,
          'instock': true,
          'owner_id': 1
        },
        {
          'id': 1,
          'name': 'Sun Ra: Space Is The Place',
          'description': 'an excellent introduction to Sun Ras vast and free-form jazz catalog',
          'genre_id': 3,
          'genre': 'jazz',
          'price': 20,
          'instock': true,
          'owner_id': 1
        },
        {
          'id': 5,
          'name': 'Sam Cooke: Live At The Harlem Square Club',
          'description': 'the second live album by the American singer-songwriter Sam Cooke',
          'genre_id': 4,
          'genre': 'soul',
          'price': 24,
          'instock': true,
          'owner_id': 1
        },
        {
          'id': 6,
          'name': 'Duster: Stratosphere',
          'description': 'the debut studio album by American space-rock band Duster',
          'genre_id': 5,
          'genre': 'slow-core',
          'price': 23,
          'instock': false,
          'owner_id': 1
        }

      ];

      const data = await fakeRequest(app)
        .get('/albums')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
    test('returns a single item with matching id', async () => {

      const expectation =
      {
        'id': 1,
        'name': 'Sun Ra: Space Is The Place',
        'description': 'an excellent introduction to Sun Ras vast and free-form jazz catalog',
        'genre_id': 3,
        'genre': 'jazz',
        'price': 20,
        'instock': true,
        'owner_id': 1
      };



      const data = await fakeRequest(app)
        .get('/albums/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });


    test('creates a new album and adds it to our album list', async () => {

      const newAlbum =
      {
        name: 'Jock Jams vol 17',
        description: 'jock jams, duh',
        genre_id: 2,

        price: 100,
        instock: true,

      };
      const expectedAlbum = {
        ...newAlbum,
        id: 9,
        owner_id: 1
      };



      const data = await fakeRequest(app)
        .post('/albums')
        .send(newAlbum)
        .expect('Content-Type', /json/)
        .expect(200);


      expect(data.body).toEqual(expectedAlbum);

      const allAlbums = await fakeRequest(app)
        .get('/albums')
        .expect('Content-Type', /json/)
        .expect(200);

      const jockJams = allAlbums.body.find(album => album.name === 'Jock Jams vol 17');

      expect(jockJams).toEqual({ ...expectedAlbum, genre: '80s bangers' });
    });

    test('updates info on an album', async () => {

      const newAlbum =
      {

        name: 'Os Mutantes',
        description: 'the debut eponymous album by the Brazilian tropicalia band Os Mutantes',
        genre_id: 1,

        price: 18,
        instock: true,


      };
      const expectedAlbum = {
        ...newAlbum,
        // genre: 'sixties/psych',
        id: 2,
        owner_id: 1
      };



      const data = await fakeRequest(app)
        .put('/albums/2')
        .send(newAlbum)
        .expect('Content-Type', /json/)
        .expect(200);


      expect(data.body).toEqual(expectedAlbum);

      const updateAlbums = await fakeRequest(app)
        .get('/albums/2')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(updateAlbums.body).toEqual({ ...expectedAlbum, genre: 'sixties/psych' });
    });

    test('deletes an album with matching ID', async () => {

      const expectation =
      {
        id: 9,
        name: 'Jock Jams vol 17',
        description: 'jock jams, duh',
        genre_id: 2,
        // genre: '80s bangers',
        price: 100,
        instock: true,
        owner_id: 1

      };

      const data = await fakeRequest(app)
        .delete('/albums/9')
        .expect('Content-Type', /json/)
        .expect(200);


      expect(data.body).toEqual(expectation);

      const nothing = await fakeRequest(app)
        .delete('/albums/9')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(nothing.body).toEqual('');
    });
  });
});

