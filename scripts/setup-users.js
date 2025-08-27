const bcrypt = require('bcryptjs');

async function generateHashedPasswords() {
  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 12);
  
  console.log('Hashed password for all users:', hashedPassword);
  console.log('\nSQL Insert statements:');
  
  const users = [
    { username: 'juri1', role: 'JURI' },
    { username: 'juri2', role: 'JURI' },
    { username: 'juri3', role: 'JURI' },
    { username: 'juri4', role: 'JURI' },
    { username: 'juri5', role: 'JURI' },
    { username: 'sirkulator_putra', role: 'SIRKULATOR_PUTRA' },
    { username: 'sirkulator_putri', role: 'SIRKULATOR_PUTRI' }
  ];

  users.forEach(user => {
    console.log(`INSERT INTO users (username, password_hash, role) VALUES ('${user.username}', '${hashedPassword}', '${user.role}');`);
  });
}

generateHashedPasswords().catch(console.error);