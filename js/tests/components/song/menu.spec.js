import each from 'jest-each'
import Component from '@/components/song/menu.vue'
import { download } from '@/services'
import { songStore, playlistStore, queueStore, favoriteStore, sharedStore, userStore } from '@/stores'
import { event } from '@/utils'
import factory from '@/tests/factory'
import { mock } from '@/tests/__helpers__'

describe('components/song/menu', () => {
  let songs, wrapper

  beforeEach(() => {
    userStore.current.is_admin = true
    sharedStore.state.allowDownload = true
    songs = factory('song', 2)
    wrapper = shallow(Component, {
      propsData: { songs },
      data: () => ({ copyable: true })
    })
  })

  afterEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  it('renders properly', () => {
    const selectors = [
      '.playback',
      '.go-to-album',
      '.go-to-artist',
      '.after-current',
      '.bottom-queue',
      '.top-queue',
      '.favorite'
    ]
    expect(shallow(Component, { propsData: { songs }}).hasAll(...selectors)).toBe(true)
  })

  each([
    ['after current', '.after-current', 'queueAfterCurrent', []],
    ['to bottom', '.bottom-queue', 'queue', []],
    ['to top', '.top-queue', 'queue', [false, true]]
  ]).test('queues songs %s when "%s" is clicked', (to, selector, queueFunc, queueFuncExtraArgs) => {
    const m = mock(queueStore, queueFunc)
    wrapper.click(selector)
    expect(m).toHaveBeenCalledWith(songs, ...queueFuncExtraArgs)
  })

  it('adds songs to favorite', () => {
    const m = mock(favoriteStore, 'like')
    wrapper.click('.favorite')
    expect(m).toHaveBeenCalledWith(songs)
  })

  it('adds songs to existing playlist', () => {
    playlistStore.all = factory('playlist', 5)
    const m = mock(playlistStore, 'addSongs')
    const html = wrapper.html()
    playlistStore.all.forEach(playlist => expect(html).toMatch(playlist.name))
    wrapper.click('.playlist')
    expect(m).toHaveBeenCalledWith(playlistStore.all[0], songs)
  })

  it('opens the edit form', () => {
    const m = mock(event, 'emit')
    userStore.current.is_admin = true
    wrapper.click('.open-edit-form')
    expect(m).toHaveBeenCalledWith('EDIT_SONGS', songs)
  })

  it('downloads', () => {
    const m = mock(download, 'fromSongs')
    wrapper.click('.download')
    expect(m).toHaveBeenCalledWith(songs)
  })

  it('copies URL', () => {
    const m = mock(songStore, 'getShareableUrl')
    const song = factory('song')
    wrapper.setProps({ songs: [song] })
    wrapper.click('.copy-url')
    expect(m).toHaveBeenCalledWith(song)
  })
})
