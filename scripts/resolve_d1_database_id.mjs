const databaseName = process.argv[2];
if (!databaseName) throw new Error('Pass the D1 database name as the first argument.');

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  input += chunk;
});
process.stdin.on('end', () => {
  const response = JSON.parse(input);
  const databases = Array.isArray(response)
    ? response
    : response.result || response.results || [];
  const matches = databases.filter((database) => database.name === databaseName);

  if (matches.length !== 1) {
    throw new Error(`Expected exactly one D1 database named ${databaseName}, found ${matches.length}.`);
  }

  const databaseId = matches[0].uuid || matches[0].database_id;
  if (!databaseId) throw new Error(`No ID found for D1 database ${databaseName}.`);
  process.stdout.write(`${databaseId}\n`);
});