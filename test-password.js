#!/usr/bin/env node

import bcrypt from 'bcryptjs'

async function testPasswords() {
    const candidates = ['123456', 'carli123', 'carlos123', 'password', '123123', 'admin', 'carlos', 'cvecinav'];
    const hash = '$2a$12$sS.fClHXNueKdYv7ffylVeYb/ZuLn5n66VAtC1TifkB2vueg2pRPO';
    
    console.log('Testing password candidates against hash...');
    
    for (const password of candidates) {
        const isValid = await bcrypt.compare(password, hash);
        console.log(`Password "${password}": ${isValid ? '✅ MATCH' : '❌ No match'}`);
    }
    
    // Generate a new hash for 123456 to compare
    console.log('\nGenerating new hash for "123456":');
    const newHash = await bcrypt.hash('123456', 12);
    console.log('New hash:', newHash);
    
    const testNewHash = await bcrypt.compare('123456', newHash);
    console.log('Test new hash with "123456":', testNewHash ? '✅ MATCH' : '❌ No match');
}

testPasswords();
