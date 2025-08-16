#!/usr/bin/env node

import http from 'http'

async function testRegisterEndpoint() {
    const data = JSON.stringify({
        name: 'Carlos Vecina',
        email: 'cvecinav@gmail.com',
        password: '123456',
        confirmPassword: '123456',
        nickname: 'Carli'
    })
    
    const options = {
        hostname: 'localhost',
        port: 3002,
        path: '/api/auth/register',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    }
    
    console.log('[REGISTER TEST] Testing register endpoint...')
    
    const req = http.request(options, (res) => {
        console.log('[REGISTER TEST] Status:', res.statusCode)
        console.log('[REGISTER TEST] Headers:', JSON.stringify(res.headers, null, 2))
        
        let body = ''
        res.on('data', (chunk) => {
            body += chunk
        })
        
        res.on('end', () => {
            console.log('[REGISTER TEST] Response body:')
            try {
                const parsed = JSON.parse(body)
                console.log(JSON.stringify(parsed, null, 2))
                
                if (parsed.success) {
                    console.log('\n✅ Register successful!')
                    console.log('User ID:', parsed.data.user.id)
                    console.log('User Name:', parsed.data.user.name)
                    console.log('Token generated:', !!parsed.data.token)
                } else {
                    console.log('\n❌ Register failed:', parsed.message)
                }
            } catch (e) {
                console.log('Raw response:', body)
            }
        })
    })
    
    req.on('error', (error) => {
        console.error('[REGISTER TEST] Request error:', error)
    })
    
    req.write(data)
    req.end()
}

// Wait a moment for server to be ready
setTimeout(testRegisterEndpoint, 2000)
