#!/usr/bin/env node

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function testLogin() {
    console.log('[LOGIN TEST] Starting login test...')
    
    const email = 'cvecinav@gmail.com'
    const password = '123456'
    
    try {
        // Leer archivo de usuarios
        console.log('[LOGIN TEST] Reading users file...')
        const usersFilePath = path.join(__dirname, 'data', 'auth-users.json')
        const usersFileContent = readFileSync(usersFilePath, 'utf8')
        const usersData = JSON.parse(usersFileContent)
        
        // Obtener array de usuarios
        const users = Array.isArray(usersData) ? usersData : usersData.users || []
        console.log('[LOGIN TEST] Users loaded:', users.length)
        
        if (users.length === 0) {
            console.log('[LOGIN TEST] No users found in file')
            return
        }
        
        // Buscar usuario por email
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())
        console.log('[LOGIN TEST] User found:', !!user)
        
        if (!user) {
            console.log('[LOGIN TEST] User not found for email:', email)
            return
        }
        
        console.log('[LOGIN TEST] User details:')
        console.log('- ID:', user.id)
        console.log('- Name:', user.name)
        console.log('- Email:', user.email)
        console.log('- Status:', user.status)
        
        // Verificar contraseña
        console.log('[LOGIN TEST] Verifying password...')
        const isValidPassword = await bcrypt.compare(password, user.password)
        console.log('[LOGIN TEST] Password valid:', isValidPassword)
        
        if (!isValidPassword) {
            console.log('[LOGIN TEST] Invalid password')
            return
        }
        
        // Verificar estado
        if (user.status !== 'active') {
            console.log('[LOGIN TEST] User account not active:', user.status)
            return
        }
        
        // Generar JWT
        console.log('[LOGIN TEST] Generating JWT...')
        const jwtSecret = process.env.JWT_SECRET || 'dame-mi-dinero-secret-key-2024'
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email,
                name: user.name,
                nickname: user.nickname
            },
            jwtSecret,
            { expiresIn: '7d' }
        )
        
        console.log('[LOGIN TEST] JWT generated successfully')
        console.log('[LOGIN TEST] Token length:', token.length)
        
        // Mostrar resultado exitoso
        const { password: _, ...userWithoutPassword } = user
        
        console.log('[LOGIN TEST] Login simulation successful!')
        console.log('[LOGIN TEST] User data:', JSON.stringify(userWithoutPassword, null, 2))
        console.log('[LOGIN TEST] Token preview:', token.substring(0, 50) + '...')
        
    } catch (error) {
        console.error('[LOGIN TEST] Error during test:', error)
    }
}

// Ejecutar test
testLogin()
