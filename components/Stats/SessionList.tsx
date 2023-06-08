import { StyleSheet, Text, View, FlatList } from 'react-native'
import React from 'react'
import formatTime  from '../../helpers/formatTime';

interface Props
{
	filteredUserSessions: any[]
	sessionCategories: string[]
}

const SessionList = ({filteredUserSessions, sessionCategories}: Props) => {
  return (
		<View style={{ height: 575 }}>
			<FlatList
				data={filteredUserSessions}
				renderItem={({ item, index }) => (
					<View
						key={index}
						style={styles.listItem}>
						<Text
							style={{
								color: 'white',
								fontSize: 18,
								fontWeight: 'bold',
							}}>
							Title: {item.sessionName}
						</Text>
						<Text
							style={{
								color: 'white',
								fontSize: 18,
								fontWeight: 'bold',
							}}>
							Category: {sessionCategories[Number(item.sessionCategoryId)]}
						</Text>

						{item.sessionDescription && (
							<Text style={{ color: 'white', fontSize: 16 }}>
								Desc: {item.sessionDescription}
							</Text>
						)}
						<Text style={{ color: 'white', fontSize: 16 }}>
							Date: {item.dateAdded}
						</Text>
						<Text style={{ color: 'white', fontSize: 16 }}>
							Miles: {(item.totalDistanceHiked).toFixed(2)} mi.
						</Text>
						<Text style={{ color: 'white', fontSize: 16 }}>
							Time: {formatTime(item.totalSessionTime)} 
						</Text>
					</View>
				)}
			/>
		</View>
  );
}

export default SessionList

const styles = StyleSheet.create({
	listItem: {
		borderBottomWidth: 1,
		borderColor: 'rgba(150, 100, 0, .3)',
		padding: 20,
	},
});