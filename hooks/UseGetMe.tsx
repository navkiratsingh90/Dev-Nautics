"use client"
import React, { useEffect } from 'react'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { useAppDispatch } from '@/redux/hooks'
import { getUserData, handleUserData } from '@/features/userSlice'


const UseGetMe = (enabled : boolean) => {
	const dispatch = useAppDispatch()
	useEffect( () => {
		if (!enabled) return
		const getMe = async () => {
		const {data} = await axios.get('/api/auth/me')
		console.log(data);
		
		dispatch(handleUserData(data))
		}
		getMe()
	}, [enabled])
}

export default UseGetMe