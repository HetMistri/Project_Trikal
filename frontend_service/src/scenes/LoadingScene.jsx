import React from 'react'

export default function LoadingScene({ progress = 0, onComplete = () => {} }) {
	return (
		<div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#001' }}>
			<div style={{ color: '#fff', textAlign: 'center' }}>
				<h2>Loading</h2>
				<div>{progress}%</div>
			</div>
		</div>
	)
}
