export const mockGraph = {
  "branches": [
    {
      "id": "b1",
      "name": "Main Trunk: SpaceX Mars Ambitions"
    },
    {
      "id": "b2",
      "name": "Strategic Shift: Moon Prioritization"
    }
  ],
  "nodes": [
    {
      "id": "n1",
      "type": "entity",
      "title": "SpaceX",
      "summary": "An American aerospace manufacturer and space transport services company founded by Elon Musk, known for its ambitious goals including colonizing Mars and developing advanced reusable rocket technology.",
      "date": "2025-09-29",
      "sources": [
        {
          "name": "Forbes",
          "slant": "neutral",
          "excerpt": "SpaceX Mars Mission Comes Under Fire From The World\u2019s Top Mars Scholar"
        },
        {
          "name": "Aerospace America",
          "slant": "neutral",
          "excerpt": "A Closer Look at SpaceX's Mars Plan"
        }
      ],
      "branchId": "b1"
    },
    {
      "id": "n2",
      "type": "entity",
      "title": "Elon Musk",
      "summary": "CEO of SpaceX, a prominent entrepreneur and visionary whose statements often dictate the strategic direction and public perception of SpaceX's space exploration goals.",
      "date": "2025-09-29",
      "sources": [
        {
          "name": "Scientific American",
          "slant": "neutral",
          "excerpt": "Elon Musk says SpaceX will prioritize a city on the moon instead of a colony on Mars"
        },
        {
          "name": "Time Magazine",
          "slant": "neutral",
          "excerpt": "Elon Musk Postpones Mars Plans in Favor of Building \u201cMoon City\u201d"
        }
      ],
      "branchId": "b1"
    },
    {
      "id": "n3",
      "type": "event",
      "title": "SpaceX's Initial Mars Colonization Plans Detailed",
      "summary": "SpaceX had well-documented and ambitious plans for establishing a human colony on Mars, a long-term vision championed by Elon Musk, involving significant technological development for interplanetary travel and settlement.",
      "date": "2025-12-07",
      "sources": [
        {
          "name": "Aerospace America",
          "slant": "neutral",
          "excerpt": "A Closer Look at SpaceX's Mars Plan"
        }
      ],
      "branchId": "b1"
    },
    {
      "id": "n4",
      "type": "event",
      "title": "Criticism of SpaceX's Mars Mission Emerges",
      "summary": "SpaceX's ambitious Mars mission plans faced scrutiny and criticism from leading experts, including 'The World\u2019s Top Mars Scholar,' raising questions about the feasibility or approach of the proposed colonization efforts.",
      "date": "2025-09-29",
      "sources": [
        {
          "name": "Forbes",
          "slant": "neutral",
          "excerpt": "SpaceX Mars Mission Comes Under Fire From The World\u2019s Top Mars Scholar"
        }
      ],
      "branchId": "b1"
    },
    {
      "id": "n5",
      "type": "event",
      "title": "Elon Musk Announces Shift to Moon Focus",
      "summary": "Elon Musk publicly stated that SpaceX would prioritize building a 'self-growing city' on the Moon, signaling a significant strategic redirection away from Mars as the immediate primary deep-space goal.",
      "date": "2026-02-09",
      "sources": [
        {
          "name": "Scientific American",
          "slant": "neutral",
          "excerpt": "Elon Musk says SpaceX will prioritize a city on the moon instead of a colony on Mars"
        },
        {
          "name": "SpaceNews",
          "slant": "neutral",
          "excerpt": "Musk says SpaceX focus is on the moon rather than Mars"
        },
        {
          "name": "Reuters",
          "slant": "neutral",
          "excerpt": "SpaceX prioritizes lunar 'self-growing city' over Mars project, Musk says"
        },
        {
          "name": "Time Magazine",
          "slant": "neutral",
          "excerpt": "Elon Musk Postpones Mars Plans in Favor of Building \u201cMoon City\u201d"
        },
        {
          "name": "bgr.com",
          "slant": "neutral",
          "excerpt": "Elon Musk Has Shifted SpaceX's Focus From Its Mars Base To Somewhere A Bit Closer"
        }
      ],
      "branchId": "b2"
    },
    {
      "id": "n6",
      "type": "data",
      "title": "SpaceX Prioritizes Lunar City Over Mars Colony",
      "summary": "Following Elon Musk's announcement, SpaceX's immediate strategic priority shifted towards establishing a 'self-growing city' on the Moon, effectively placing Mars colonization efforts on a secondary or deferred track.",
      "date": "2026-02-09",
      "sources": [
        {
          "name": "Scientific American",
          "slant": "neutral",
          "excerpt": "Elon Musk says SpaceX will prioritize a city on the moon instead of a colony on Mars"
        },
        {
          "name": "Reuters",
          "slant": "neutral",
          "excerpt": "SpaceX prioritizes lunar 'self-growing city' over Mars project, Musk says"
        },
        {
          "name": "WSJ",
          "slant": "neutral",
          "excerpt": "SpaceX Delays Mars Plans To Focus on Moon"
        },
        {
          "name": "Time Magazine",
          "slant": "neutral",
          "excerpt": "Elon Musk Postpones Mars Plans in Favor of Building \u201cMoon City\u201d"
        },
        {
          "name": "bgr.com",
          "slant": "neutral",
          "excerpt": "Elon Musk Has Shifted SpaceX's Focus From Its Mars Base To Somewhere A Bit Closer"
        }
      ],
      "branchId": "b2"
    },
    {
      "id": "n7",
      "type": "event",
      "title": "SpaceX Delays Mars Plans",
      "summary": "As a direct consequence of the new strategic focus on the Moon, SpaceX's previously outlined plans for Mars missions and colonization were postponed, indicating a deferral of the timeline for human settlement on the Red Planet.",
      "date": "2026-02-06",
      "sources": [
        {
          "name": "WSJ",
          "slant": "neutral",
          "excerpt": "SpaceX Delays Mars Plans To Focus on Moon"
        },
        {
          "name": "Time Magazine",
          "slant": "neutral",
          "excerpt": "Elon Musk Postpones Mars Plans in Favor of Building \u201cMoon City\u201d"
        },
        {
          "name": "bgr.com",
          "slant": "neutral",
          "excerpt": "Elon Musk Has Shifted SpaceX's Focus From Its Mars Base To Somewhere A Bit Closer"
        }
      ],
      "branchId": "b2"
    }
  ],
  "links": [
    {
      "source": "n2",
      "target": "n1",
      "label": "orchestrated by"
    },
    {
      "source": "n1",
      "target": "n3",
      "label": "part of"
    },
    {
      "source": "n4",
      "target": "n3",
      "label": "impacts"
    },
    {
      "source": "n2",
      "target": "n5",
      "label": "leads to"
    },
    {
      "source": "n5",
      "target": "n6",
      "label": "triggers"
    },
    {
      "source": "n6",
      "target": "n7",
      "label": "causes"
    }
  ]
};
