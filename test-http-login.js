#!/usr/bin/env node

import http from 'http'

async function testLoginEndpoint() {
    const data = JSON.stringify({
        email: 'cvecinav@gmail.com',
        password: '123456'
    })
    
    const options = {
        hostname: 'localhost',
        port: 3002,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    }
    
    console.log('[HTTP TEST] Testing login endpoint...')
    
    const req = http.request(options, (res) => {
        console.log('[HTTP TEST] Status:', res.statusCode)
        console.log('[HTTP TEST] Headers:', JSON.stringify(res.headers, null, 2))
        
        let body = ''
        res.on('data', (chunk) => {
            body += chunk
        })
        
        res.on('end', () => {
            console.log('[HTTP TEST] Response body:')
            try {
                const parsed = JSON.parse(body)
                console.log(JSON.stringify(parsed, null, 2))
            } catch (e) {
                console.log('Raw response:', body)
            }
        })
    })
    
    req.on('error', (error) => {
        console.error('[HTTP TEST] Request error:', error)
    })
    
    req.write(data)
    req.end()
}

// Wait a moment for server to be ready
setTimeout(testLoginEndpoint, 2000)
