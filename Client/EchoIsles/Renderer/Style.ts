export module Style {
    export const current = {
        bar: {
            minBeatSpacing: 10,
            maxBeatSpacingRatio: 4,
            lineHeight: 12,
            ceilingSpacing: 12,
            floorSpacing: 12
        },

        barLine: {
            margin: 8
        },

        note: {
            head : {
                alternationOffsetWithHarmonics: 20,
                alternationOffset: 12
            },
            stem: {
                standardHeight: 24,
                minimumEpitaxy: 16
            }
        },

        beam: {
            minimumVerticalPadding: 6
        }
    }
};