import * as networkDrive from 'windows-network-drive'
import * as chokidar from 'chokidar'
import { FileShareHandler } from '../../storageHandlers/fileShareHandler'
import { StorageType } from '../../api'

jest.mock('windows-network-drive')
jest.mock('chokidar')
;(chokidar as any).on = (chokidar as any).watch = jest.fn().mockImplementation((event: string, handler: Function) => {
	if (event === 'ready') {
		setTimeout(() => {
			handler()
		})
	}
	return chokidar
})
;(networkDrive as any).mount = jest.fn().mockResolvedValue(true)
;(networkDrive as any).find = function() {
	return Promise.resolve([])
}
;(networkDrive as any).list = function() {
	return Promise.resolve({})
}

describe('FileShareHandler', () => {
	let fsh0: FileShareHandler

	beforeAll(() => {
		fsh0 = new FileShareHandler({
			id: 'remote0',
			type: StorageType.FILE_SHARE,
			support: {
				read: true,
				write: false
			},
			options: {
				basePath: '\\\\STORAGE\\public',
				mappedNetworkedDriveTarget: 'U'
			}
		})
	})

	it('mounts the network drive automatically', async () => {
		try {
			fsh0.on('error', err => fail(err))
			await fsh0.init()
		} catch (e) {
			fail(e)
		}

		expect(networkDrive.mount).toBeCalled()
	})
})
