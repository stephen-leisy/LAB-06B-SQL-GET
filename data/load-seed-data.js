const client = require('../lib/client');
// import our seed data:
const albums = require('./albums.js');
const genresData = require('./genres.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
          [user.email, user.hash]);
      })
    );


    const genres = await Promise.all(
      genresData.map(genre => {
        return client.query(`
                      INSERT INTO genres (genre_type)
                      VALUES ($1)
                      RETURNING *;
                  `,
          [genre.genre_type]);

      })
    );

    const user = users[0].rows[0];
    // const genre = genres.map(({ rows }) => rows[0]);

    await Promise.all(
      albums.map(album => {
        // const genreId = genre.genre_type;
        return client.query(`
                    INSERT INTO albums (name, description, genre_id, price, instock, owner_id)
                    VALUES ($1, $2, $3, $4, $5, $6);
                `,
          [
            album.name,
            album.description,
            album.genre_id,
            album.price,
            album.instock,
            user.id,
          ]);
      })
    );


    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch (err) {
    console.log(err);
  }
  finally {
    client.end();
  }

}
