import {
	KeyboardAvoidingView,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	View,
	Pressable,
	Modal,
	ImageBackground,
} from 'react-native';
import * as React from 'react';
import * as Type from '../db-types';
import { db } from '../dbs/sqLite/InitializeDB';
import * as SQLite from 'expo-sqlite';
import { MyContext } from '../App';
import { formatDateTime } from '../helpers/DateTime';
import * as Crypto from 'expo-crypto'
interface Props {
	sectionTitle: string;
}
const NearbyTrails = ({ sectionTitle }: Props) => {
	const {
		user,
		trails,
		setUser,
		setFetchUpdatedData,
	} = React.useContext(MyContext);
	const [showReplaceCurrentTrailModal, setShowReplaceCurrentTrailModal] =
		React.useState<boolean>(false);
	const [replacementCurrentTrailId, setReplacementCurrentTrailId] =
		React.useState<number | null>(null);

	const CapitalizeDifficulty = (str: string): string => {
		const capital = str[0].toUpperCase();
		return capital + str.slice(1, str.length);
	};

	//onPress "start Now" (number)
	const startNowClick = (
		selected_trail_id: number,
		current_trail_id: number | null,
		setUser: (prev: any) => void
	) => {
		const now = new Date();
		const formattedDateTime = formatDateTime(now);
		//if there is NOT a current trail, make it the current trail
		console.log('startNowClick', { selected_trail_id, current_trail_id });
		if (current_trail_id === null) {
			db.transaction((tx: SQLite.SQLTransaction) => {
				tx.executeSql(
					`UPDATE users 
			SET current_trail_id = ?, current_trail_progress = ?, current_trail_start_date = ?
			WHERE users.user_id = ?;`,
					[selected_trail_id, 0.0, formattedDateTime, user.user_id],
					(_tx, resulSet) => {
						console.log(
							'Current trail UPDATED successfully, updating user state'
						);
						setUser((prev: any) => ({
							...prev,
							current_trail_id: selected_trail_id,
							current_trail_progress: 0.0,
							current_trail_start_date: formattedDateTime,
						}));
					},
					(_tx, error) => {
						console.error(
							'Error updating current trail and user state',
							error
						);
						return false;
					}
				),
					() =>
						'Successful database connection to replace current trail',
					(error: SQLite.SQLError) => {
						console.error('Unable to connect to database', error);
					};
			});
		} else {
			setReplacementCurrentTrailId(selected_trail_id);
			setShowReplaceCurrentTrailModal(true);
		}
	};

	//on Press for modal
	const replaceCurrentTrail = () => {
		//Are you sure you want to replace the current trail. Current Trail progress will be rest, but toal user miles hiked will be saved.
		//if yes, set trail.trail_id(replacementTrailId)
		//else
		//setReplacementTrailId(null)
		//setReplaceCurrentTrailModal(false)
		const now: Date = new Date();
		const formattedDateTime: string = formatDateTime(now);
		db.transaction((tx: SQLite.SQLTransaction) => {
			tx.executeSql(
				`UPDATE users 
			SET current_trail_id = ?, current_trail_progress = ?, current_trail_start_date = ?
			WHERE users.user_id = ?`,
				[replacementCurrentTrailId, 0.0, formattedDateTime, user.user_id],
				(_tx) => {
					console.log(
						'Current trail UPDATED successfully, updating user state'
					);
					setUser((prev: any) => ({
						...prev,
						current_trail_id: replacementCurrentTrailId,
						current_trail_progress: 0.0,
						current_trail_start_date: formattedDateTime,
					}));
					setReplacementCurrentTrailId(null);
					setShowReplaceCurrentTrailModal(false);
					//setFetchUpdatedData(true);
				},
				(tx, error) => {
					console.error(
						'Error updating current trail and user state',
						error
					);
					return false;
				}
			),
				(error: SQLite.SQLError) => {
					console.error('Unable to connect to database', error);
					return false;
				},
				() =>
					console.log(
						'Successful database connection to replace current trail'
					);
		});
	};

	const onAddToQueueClick = (
		user_id: number,
		selected_trail_id: number,
		date_added: any
	) => {
		//const date = new Date().getUTCDate()
		db.transaction((tx: SQLite.SQLTransaction) => {
			tx.executeSql(
				`INSERT INTO hiking_queue (hiking_queue_id, user_id, trail_id, date_added) VALUES (?, ?, ?, ?);`,
				[Crypto.randomUUID(), user_id, selected_trail_id, date_added],
				() => {
					console.log(
						'SUCESSFULLY added Trail to users hiking_queue'
					);
					setFetchUpdatedData(true);
				},
				(_tx, error: SQLite.SQLError) => {
					console.error(
						'ERROR: Unable to add new trail to hiking queue',
						error
					);
					return false;
				}
			);
		});
	};

	const onDeleteFromQueueClick = (
		user_id: number,
		selected_trail_id: number
	) => {
		//const date = new Date().getUTCDate()
		db.transaction((tx: SQLite.SQLTransaction) => {
			tx.executeSql(
				`DELETE FROM hiking_queue WHERE user_id = ? AND trail_id = ? ;`,
				[user_id, selected_trail_id],
				() => {
					console.log(
						'SUCESSFULLY Deleted Trail from users hiking_queue'
					);
					setFetchUpdatedData(true);
				},
				(_tx, error: SQLite.SQLError) => {
					console.error(
						'ERROR: Unable to delete new trail to hiking queue',
						error
					);
					return false;
				}
			);
		});
	};
	return showReplaceCurrentTrailModal ? (
		<Modal
			animationType="fade"
			transparent={true}
			visible={showReplaceCurrentTrailModal}
			onRequestClose={() => {
				setShowReplaceCurrentTrailModal(!showReplaceCurrentTrailModal);
			}}>
			<View style={styles.centeredView}>
				<View style={styles.modalView}>
					<Text style={styles.modalText}>
						Are you sure you want to replace your current trail?
						(Current Trail progress will be RESET, but total user
						miles hiked will be saved.)
					</Text>
					<Pressable
						style={[styles.button, styles.buttonCancel]}
						onPress={() => {
							setShowReplaceCurrentTrailModal((prev) => !prev);
							setReplacementCurrentTrailId(null);
						}}>
						<Text style={styles.textStyle}>Cancel</Text>
					</Pressable>
					<Pressable
						style={[styles.button, styles.buttonExit]}
						onPress={() => replaceCurrentTrail()}>
						<Text style={styles.textStyle}>Change</Text>
					</Pressable>
				</View>
			</View>
		</Modal>
	) : (
		<SafeAreaView>
			<ScrollView
				style={{
					backgroundColor: 'transparent',
					borderTopWidth: 1,
						borderColor: 'rgb(31,33,35)',
					padding: 10
				}}>
				<Text style={styles.H2}>{sectionTitle}</Text>
				<ScrollView horizontal>
					{trails.map((trail: Type.Trail) => (
						<View
							key={trail.trail_id}
							style={{
								height: '100%',
								position: 'relative',
								marginRight: 40,
								marginVertical: 10,
								padding: 10,
							}}>
							<ImageBackground
								source={
									trail.trail_image_url
										? { uri: trail.trail_image_url }
										: require('../assets/trailpic.jpg')
								}
								style={{
									width: 250,
									height: 150,
								}}
								imageStyle={{
									borderRadius: 20,
									borderColor: 'rgb(31, 33, 35)',
									borderWidth: 2,
									shadowColor: 'white',
									shadowRadius: 20,
								}}>
								<Text
									style={
										trail.completed
											? {
													position: 'absolute',
													backgroundColor:
														'rgb(41,184,169)',
													top: 20,
													width: 80,
													textAlign: 'center',
											  }
											: {}
									}>
									{trail.completed ? (
										<Text
											style={{
												color: 'white',
												fontSize: 12,
												fontWeight: '600',
												marginLeft: 5,
											}}>
											Completed
										</Text>
									) : (
										<></>
									)}
								</Text>
							</ImageBackground>

							<View style={{ marginTop: 10, padding: 5 }}>
								<Text
									style={
										trail.trail_difficulty === 'short'
											? styles.TrailEasy
											: trail.trail_difficulty ===
											  'moderate'
											? styles.TrailModerate
											: styles.TrailHard
									}>
									{CapitalizeDifficulty(
										trail.trail_difficulty
									)}
								</Text>
								<Text style={styles.TrailName}>
									{trail.trail_name}
								</Text>
								<Text style={styles.TrailPark}>
									{trail.park_name} Park
								</Text>
								<Text style={styles.TrailDistance}>
									Distance: {trail.trail_distance} mi - Est{' '}
									{(trail.trail_distance / 2).toFixed()} hr.
								</Text>
								<View style={{ position: 'relative' }}>
									<Text
										style={{
											position: 'absolute',
											right: 10,
											bottom: 90,
										}}>
										{trail.queued == 1 ? (
											<Pressable
												onPress={() =>
													onDeleteFromQueueClick(
														user.user_id,
														trail.trail_id
													)
												}>
												<Text
													style={[
														styles.QueueButtons,
														{
															color: !trail.queued
																? 'rgb(7,254,213)'
																: 'red',
														},
													]}>
													-
												</Text>
											</Pressable>
										) : (
											<Pressable
												onPress={() =>
													onAddToQueueClick(
														user.user_id,
														trail.trail_id,
														formatDateTime(
															new Date()
														)
													)
												}>
												<Text
													style={[
														styles.QueueButtons,
														{
															color: !trail.queued
																? 'rgb(7,254,213)'
																: 'red',
														},
													]}>
													+
												</Text>
											</Pressable>
										)}
									</Text>
									<Pressable
										style={{
											backgroundColor:
												user.current_trail_id ==
												trail.trail_id
													? 'gray'
													: 'rgb(7,254,213)',
											width: '50%',
											borderRadius: 10,
											paddingVertical: 5,
											marginTop: 10,
										}}
										onPress={() =>
											startNowClick(
												trail.trail_id,
												user.current_trail_id,
												setUser
											)
										}
										disabled={
											user.current_trail_id ==
											trail.trail_id
										}>
										<Text
											style={{
												color: 'rgb(31,33,35)',
												fontWeight: 'bold',
												fontSize: 16,
												textAlign: 'center',
											}}>
											{user.current_trail_id ==
											trail.trail_id
												? 'In Progress'
												: 'Start Now'}
										</Text>
									</Pressable>
								</View>
							</View>
						</View>
					))}
				</ScrollView>
			</ScrollView>
		</SafeAreaView>
	);
};

export default NearbyTrails;

const styles = StyleSheet.create({
	Container: {
		flex: 1,
		padding: 20,
		marginTop: 0,
	},
	QueueButtons: {
		color: 'rgb(249,253,255)',
		fontSize: 26,
		fontWeight: '900',
	},
	H1: {
		color: 'rgb(249,253,255)',
		fontSize: 24,
		fontWeight: '900',
		marginBottom: 10,
	},
	H2: {
		color: 'rgb(249,253,255)',
		fontSize: 22,
		fontWeight: '800',
		marginVertical: 10,
	},
	TrailName: {
		color: 'rgb(249,253,255)',
		fontSize: 18,
		fontWeight: '600',
		marginBottom: 0,
	},
	TrailEasy: {
		color: 'limegreen',
		fontSize: 16,
		fontWeight: '300',
		marginBottom: 5,
	},
	TrailModerate: {
		color: 'orange',
		fontSize: 16,
		fontWeight: '300',
		marginBottom: 5,
	},
	TrailHard: {
		color: 'red',
		fontSize: 16,
		fontWeight: '300',
		marginBottom: 5,
	},
	TrailDistance: {
		color: 'rgb(221,224,226)',
		fontSize: 14,
		fontWeight: '300',
		marginBottom: 0,
	},
	TrailPark: {
		color: 'rgb(221,224,226)',
		fontSize: 16,
		fontWeight: '400',
		marginBottom: 0,
	},
	centeredView: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 22,
	},
	modalView: {
		margin: 20,
		backgroundColor: 'rgb(31,33,35)',
		borderRadius: 20,
		padding: 35,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	button: {
		borderRadius: 20,
		padding: 10,
		elevation: 2,
	},
	buttonExit: {
		backgroundColor: 'green',
	},
	buttonCancel: {
		backgroundColor: 'grey',
	},
	textStyle: {
		color: 'rgb(249,253,255)',
		fontWeight: 'bold',
		textAlign: 'center',
	},
	modalText: {
		marginBottom: 15,
		textAlign: 'center',
	},
});
