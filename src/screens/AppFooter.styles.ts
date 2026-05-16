import { StyleSheet } from 'react-native';

const PRIMARY_ACTIVE_COLOR = '#0C1559';
const INACTIVE_COLOR = '#000000';
const FOOTER_BG_COLOR = '#C3E2F1';

const footerStyles = StyleSheet.create({
    footer: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderColor: PRIMARY_ACTIVE_COLOR,
        paddingTop: 10,
        paddingHorizontal: 10,
        justifyContent: 'space-around',
        backgroundColor: FOOTER_BG_COLOR,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        // paddingBottom is set dynamically in AppFooter.tsx via useSafeAreaInsets
    },
    footerItem: {
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: INACTIVE_COLOR,
    },
    footerIcon1: {
        width: 21,
        height: 37,
        marginBottom: 4,
    },
    footerIcon2: {
        width: 40,
        height: 40,
        marginBottom: 4,
    },
    footerIcon3: {
        width: 32,
        height: 32,
        marginBottom: 4,
    },
});

export default footerStyles;
