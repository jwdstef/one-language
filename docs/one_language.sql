/*
 Navicat Premium Dump SQL

 Source Server         : 120.26.90.169
 Source Server Type    : MySQL
 Source Server Version : 50744 (5.7.44)
 Source Host           : 120.26.90.169:3307
 Source Schema         : one_language

 Target Server Type    : MySQL
 Target Server Version : 50744 (5.7.44)
 File Encoding         : 65001

 Date: 31/12/2025 11:03:44
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for favorite_words
-- ----------------------------
DROP TABLE IF EXISTS `favorite_words`;
CREATE TABLE `favorite_words`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `word` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `pronunciation` json NULL,
  `meanings` json NULL,
  `example_sentences` json NULL,
  `source_url` varchar(2048) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `context` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `tags` json NOT NULL,
  `mastery_level` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'new',
  `review_count` int(11) NOT NULL DEFAULT 0,
  `last_reviewed_at` datetime(3) NULL DEFAULT NULL,
  `favorited_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `favorite_words_user_id_word_key`(`user_id`, `word`) USING BTREE,
  INDEX `favorite_words_user_id_idx`(`user_id`) USING BTREE,
  INDEX `favorite_words_word_idx`(`word`) USING BTREE,
  INDEX `favorite_words_favorited_at_idx`(`favorited_at`) USING BTREE,
  CONSTRAINT `favorite_words_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of favorite_words
-- ----------------------------
INSERT INTO `favorite_words` VALUES ('1fd03f50-4d40-4788-b0de-44003b3c2862', '3b720d80-7422-4769-90ee-f9199f08ba70', 'negotiate', '协商', '{\"audioUrl\": \"https://api.dictionaryapi.dev/media/pronunciations/en/negotiate-au.mp3\", \"phonetic\": \"/nəˈɡoʊ.ʃi.eɪt/\", \"ukPhonetic\": \"\", \"usPhonetic\": \"/nəˈɡoʊ.ʃi.eɪt/\"}', '[{\"definition\": \"谈判\", \"partOfSpeech\": \"v.\"}, {\"definition\": \"协商\", \"partOfSpeech\": \"\"}, {\"definition\": \"达成协议\", \"partOfSpeech\": \"\"}]', '[{\"sentence\": \"The client and server computers must first negotiate a network protocol to be used.\", \"translation\": \"\"}]', 'https://baijiahao.baidu.com/s?id=1852808368355916262&wfr=spider&for=pc', ' negotiate ', '[\"source:baijiahao.baidu.com\"]', 'new', 0, NULL, '2025-12-29 07:15:48.717');
INSERT INTO `favorite_words` VALUES ('26232973-8541-49aa-b13c-ac11d9fd104c', '3b720d80-7422-4769-90ee-f9199f08ba70', 'wrote', '写了个', '{\"audioUrl\": \"https://api.dictionaryapi.dev/media/pronunciations/en/wrote-us.mp3\", \"phonetic\": \"/ɹoʊt/\", \"ukPhonetic\": \"\", \"usPhonetic\": \"/ɹoʊt/\"}', '[{\"definition\": \"写（write的过去式和过去分词）\", \"partOfSpeech\": \"v.\"}]', '[{\"sentence\": \"The pupil wrote his name on the paper.\", \"translation\": \"\"}, {\"sentence\": \"My uncle writes newspaper articles for The Herald.\", \"translation\": \"\"}]', 'https://v2ex.com/', ' wrote ', '[\"source:v2ex.com\"]', 'new', 1, '2025-12-29 04:30:54.416', '2025-12-29 01:56:47.645');
INSERT INTO `favorite_words` VALUES ('8501ea24-e9d7-467e-ae8c-a842af79d339', '3b720d80-7422-4769-90ee-f9199f08ba70', 'construction', '建设', '{\"audioUrl\": \"https://api.dictionaryapi.dev/media/pronunciations/en/construction-us.mp3\", \"phonetic\": \"/kənˈstɹʌkʃən/\", \"ukPhonetic\": \"\", \"usPhonetic\": \"/kənˈstɹʌkʃən/\"}', '[{\"definition\": \"建设，建造\", \"partOfSpeech\": \"n.\"}, {\"definition\": \"构造，结构\", \"partOfSpeech\": \"\"}]', '[{\"sentence\": \"Construction is underway on the new bridge.\", \"translation\": \"\"}, {\"sentence\": \"The engineer marvelled at his construction.\", \"translation\": \"\"}]', 'https://baijiahao.baidu.com/s?id=1852808368355916262&wfr=spider&for=pc', ' construction ', '[\"source:baijiahao.baidu.com\"]', 'new', 0, NULL, '2025-12-29 07:14:30.956');
INSERT INTO `favorite_words` VALUES ('8710011d-39bc-4763-98d7-6c15f950dc37', '3b720d80-7422-4769-90ee-f9199f08ba70', 'technology', '技术', '{\"audioUrl\": \"\", \"phonetic\": \"/tɛkˈnɒlədʒi/\", \"ukPhonetic\": \"\", \"usPhonetic\": \"/tɛkˈnɒlədʒi/\"}', '[{\"definition\": \"技术\", \"partOfSpeech\": \"n.\"}, {\"definition\": \"科技\", \"partOfSpeech\": \"\"}]', '[]', 'https://v2ex.com/', ' technology ', '[\"source:v2ex.com\"]', 'new', 0, NULL, '2025-12-29 05:44:48.442');
INSERT INTO `favorite_words` VALUES ('b79a3da4-81f6-48ff-9837-0d64f4f3ef58', '3b720d80-7422-4769-90ee-f9199f08ba70', 'president', '总统', '{\"audioUrl\": \"https://api.dictionaryapi.dev/media/pronunciations/en/president-uk.mp3\", \"phonetic\": \"/ˈpɹɛzɨdənt/\", \"ukPhonetic\": \"/ˈpɹɛzɨdənt/\", \"usPhonetic\": \"/ˈpɹɛzɨdənt/\"}', '[{\"definition\": \"总统\", \"partOfSpeech\": \"n.\"}, {\"definition\": \"主席\", \"partOfSpeech\": \"\"}, {\"definition\": \"董事长\", \"partOfSpeech\": \"\"}]', '[{\"sentence\": \"The vast majority of presidents have been male.\", \"translation\": \"\"}]', 'https://baijiahao.baidu.com/s?id=1852808368355916262&wfr=spider&for=pc', ' president ', '[\"source:baijiahao.baidu.com\"]', 'new', 0, NULL, '2025-12-29 07:18:45.227');
INSERT INTO `favorite_words` VALUES ('bc432267-bb38-44e8-9ed8-b62001c0a102', '3b720d80-7422-4769-90ee-f9199f08ba70', 'quota', '额度', '{\"phonetic\": \"\"}', '[]', '[]', 'https://linux.do/t/topic/1362385', ' quota ', '[\"source:linux.do\"]', 'new', 1, '2025-12-29 04:30:47.237', '2025-12-28 10:47:30.707');
INSERT INTO `favorite_words` VALUES ('c1afafce-694d-46a1-a4e1-5f5be4e2b108', '3b720d80-7422-4769-90ee-f9199f08ba70', 'explore', '探索', '{\"audioUrl\": \"https://api.dictionaryapi.dev/media/pronunciations/en/explore-us.mp3\", \"phonetic\": \"/ɪkˈsplɔɹ/\", \"ukPhonetic\": \"\", \"usPhonetic\": \"/ɪkˈsplɔɹ/\"}', '[{\"definition\": \"探索\", \"partOfSpeech\": \"v.\"}, {\"definition\": \"探究\", \"partOfSpeech\": \"\"}]', '[{\"sentence\": \"The committee has been exploring alternative solutions to the problem at hand.\", \"translation\": \"\"}]', 'https://v2ex.com/', ' explore ', '[\"source:v2ex.com\"]', 'new', 1, '2025-12-29 04:31:00.871', '2025-12-29 04:29:21.864');
INSERT INTO `favorite_words` VALUES ('c3cfa2b3-1258-43c8-91af-5f03a4b3f5c2', '3b720d80-7422-4769-90ee-f9199f08ba70', 'development', '开发', '{\"phonetic\": \"\"}', '[]', '[]', 'https://linux.do/t/topic/1362385', ' development ', '[\"source:linux.do\"]', 'familiar', 2, '2025-12-28 10:47:56.096', '2025-12-28 10:44:01.077');
INSERT INTO `favorite_words` VALUES ('cf497172-4889-4626-9419-d017e8c3ace3', '3b720d80-7422-4769-90ee-f9199f08ba70', 'origin', '源头', '{\"audioUrl\": \"https://api.dictionaryapi.dev/media/pronunciations/en/origin-us.mp3\", \"phonetic\": \"/ˈɑɹ.ɪ.dʒɪn/\", \"ukPhonetic\": \"\", \"usPhonetic\": \"/ˈɑɹ.ɪ.dʒɪn/\"}', '[{\"definition\": \"起源；来源\", \"partOfSpeech\": \"n.\"}, {\"definition\": \"出身；背景\", \"partOfSpeech\": \"n.\"}, {\"definition\": \"起始点；开端\", \"partOfSpeech\": \"n.\"}]', '[]', 'https://mbd.baidu.com/newspage/data/landingsuper?context=%7B%22nid%22%3A%22news_10218185006334652876%22%7D&n_type=1&p_from=3', ' origin ', '[\"source:mbd.baidu.com\"]', 'new', 0, NULL, '2025-12-30 00:03:26.846');

-- ----------------------------
-- Table structure for learning_activities
-- ----------------------------
DROP TABLE IF EXISTS `learning_activities`;
CREATE TABLE `learning_activities`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `activity_type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `word_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `metadata` json NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `learning_activities_user_id_idx`(`user_id`) USING BTREE,
  INDEX `learning_activities_created_at_idx`(`created_at`) USING BTREE,
  INDEX `learning_activities_word_id_fkey`(`word_id`) USING BTREE,
  CONSTRAINT `learning_activities_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `learning_activities_word_id_fkey` FOREIGN KEY (`word_id`) REFERENCES `favorite_words` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of learning_activities
-- ----------------------------
INSERT INTO `learning_activities` VALUES ('01c9c839-556b-4d21-b536-558bbaa1b112', '3b720d80-7422-4769-90ee-f9199f08ba70', 'favorite', 'b79a3da4-81f6-48ff-9837-0d64f4f3ef58', '{\"word\": \"president\"}', '2025-12-29 07:18:46.590');
INSERT INTO `learning_activities` VALUES ('126fef62-b369-494e-906c-af48b351b9b8', '3b720d80-7422-4769-90ee-f9199f08ba70', 'favorite', 'c1afafce-694d-46a1-a4e1-5f5be4e2b108', '{\"word\": \"explore\"}', '2025-12-29 04:29:22.189');
INSERT INTO `learning_activities` VALUES ('188ba6ff-dbf2-45aa-b4e7-44625792f33a', '3b720d80-7422-4769-90ee-f9199f08ba70', 'review', 'c3cfa2b3-1258-43c8-91af-5f03a4b3f5c2', '{\"known\": true, \"newMasteryLevel\": \"familiar\", \"previousMasteryLevel\": \"learning\"}', '2025-12-28 10:47:56.341');
INSERT INTO `learning_activities` VALUES ('19a7c1bc-8908-498b-b836-55e26fe356f6', '3b720d80-7422-4769-90ee-f9199f08ba70', 'review', 'c1afafce-694d-46a1-a4e1-5f5be4e2b108', '{\"known\": false, \"newMasteryLevel\": \"new\", \"previousMasteryLevel\": \"new\"}', '2025-12-29 04:31:01.119');
INSERT INTO `learning_activities` VALUES ('1e92d1f8-2a00-4f75-b7fd-836c5a812708', '3b720d80-7422-4769-90ee-f9199f08ba70', 'review', 'bc432267-bb38-44e8-9ed8-b62001c0a102', '{\"known\": false, \"newMasteryLevel\": \"new\", \"previousMasteryLevel\": \"new\"}', '2025-12-29 04:30:47.627');
INSERT INTO `learning_activities` VALUES ('6295c316-8719-4c4a-8e0a-21e774f12ea7', '3b720d80-7422-4769-90ee-f9199f08ba70', 'favorite', '8710011d-39bc-4763-98d7-6c15f950dc37', '{\"word\": \"technology\"}', '2025-12-29 05:44:48.936');
INSERT INTO `learning_activities` VALUES ('90af8655-b1d6-46c4-b219-1ea70ff250c8', '3b720d80-7422-4769-90ee-f9199f08ba70', 'review', '26232973-8541-49aa-b13c-ac11d9fd104c', '{\"known\": false, \"newMasteryLevel\": \"new\", \"previousMasteryLevel\": \"new\"}', '2025-12-29 04:30:54.755');
INSERT INTO `learning_activities` VALUES ('919c29d1-2086-44f5-9571-d415d6a0aa3d', '3b720d80-7422-4769-90ee-f9199f08ba70', 'review', 'c3cfa2b3-1258-43c8-91af-5f03a4b3f5c2', '{\"known\": true, \"newMasteryLevel\": \"learning\", \"previousMasteryLevel\": \"new\"}', '2025-12-28 10:47:55.214');
INSERT INTO `learning_activities` VALUES ('b611bb1c-2cf0-43b9-ad50-2f80eabea66d', '3b720d80-7422-4769-90ee-f9199f08ba70', 'favorite', 'bc432267-bb38-44e8-9ed8-b62001c0a102', '{\"word\": \"quota\"}', '2025-12-28 10:47:31.020');
INSERT INTO `learning_activities` VALUES ('b917c290-ecf6-4832-beef-7fe05b09d431', '3b720d80-7422-4769-90ee-f9199f08ba70', 'favorite', 'cf497172-4889-4626-9419-d017e8c3ace3', '{\"word\": \"origin\"}', '2025-12-30 00:03:27.190');
INSERT INTO `learning_activities` VALUES ('cb3cad3e-54a7-4337-a5a0-837b1c795c7e', '3b720d80-7422-4769-90ee-f9199f08ba70', 'favorite', '8501ea24-e9d7-467e-ae8c-a842af79d339', '{\"word\": \"construction\"}', '2025-12-29 07:14:31.282');
INSERT INTO `learning_activities` VALUES ('d0172af7-1079-4f50-98c8-cf5a84cb5c6c', '3b720d80-7422-4769-90ee-f9199f08ba70', 'favorite', '1fd03f50-4d40-4788-b0de-44003b3c2862', '{\"word\": \"negotiate\"}', '2025-12-29 07:15:49.174');
INSERT INTO `learning_activities` VALUES ('d075aed3-f2aa-4a4b-a6be-033a41393851', '3b720d80-7422-4769-90ee-f9199f08ba70', 'favorite', '26232973-8541-49aa-b13c-ac11d9fd104c', '{\"word\": \"wrote\"}', '2025-12-29 01:56:48.085');
INSERT INTO `learning_activities` VALUES ('d13fa541-08c1-4a63-9435-71144844f2b6', '3b720d80-7422-4769-90ee-f9199f08ba70', 'favorite', 'c3cfa2b3-1258-43c8-91af-5f03a4b3f5c2', '{\"word\": \"development\"}', '2025-12-28 10:44:01.447');

-- ----------------------------
-- Table structure for refresh_tokens
-- ----------------------------
DROP TABLE IF EXISTS `refresh_tokens`;
CREATE TABLE `refresh_tokens`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime(3) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `refresh_tokens_token_key`(`token`) USING BTREE,
  INDEX `refresh_tokens_user_id_idx`(`user_id`) USING BTREE,
  CONSTRAINT `refresh_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of refresh_tokens
-- ----------------------------
INSERT INTO `refresh_tokens` VALUES ('04d45ec9-7374-4bf2-bbe2-2f4b79b9a51c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYjcyMGQ4MC03NDIyLTQ3NjktOTBlZS1mOTE5OWYwOGJhNzAiLCJlbWFpbCI6ImFkbWluQGlsbGEtaGVscGVyLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjkxODkwMSwiZXhwIjoxNzY3NTIzNzAxfQ.L-a09LYH0biTB0aG9HsMldT7wDFvKQKMNPx-LRqwLbA', '3b720d80-7422-4769-90ee-f9199f08ba70', '2026-01-04 10:48:21.953', '2025-12-28 10:48:21.953');
INSERT INTO `refresh_tokens` VALUES ('0e99fda2-a3a7-4967-be79-57484eb595a0', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYjcyMGQ4MC03NDIyLTQ3NjktOTBlZS1mOTE5OWYwOGJhNzAiLCJlbWFpbCI6ImFkbWluQGlsbGEtaGVscGVyLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjkyMTY3MCwiZXhwIjoxNzY3NTI2NDcwfQ.UqWUMW_Hk_JQ352f82_oO6qWeAwP3bLDDwYGPVPf0xY', '3b720d80-7422-4769-90ee-f9199f08ba70', '2026-01-04 11:34:30.996', '2025-12-28 11:34:30.998');
INSERT INTO `refresh_tokens` VALUES ('100105aa-50a2-4393-951b-b554d97bcd09', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYjcyMGQ4MC03NDIyLTQ3NjktOTBlZS1mOTE5OWYwOGJhNzAiLCJlbWFpbCI6ImFkbWluQGlsbGEtaGVscGVyLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2Njk3MzM1MiwiZXhwIjoxNzY3NTc4MTUyfQ.9afMKRxspdxvR0mvpiJuGYl1ZsVhyNGxT1_AN5Bu6dw', '3b720d80-7422-4769-90ee-f9199f08ba70', '2026-01-05 01:55:52.843', '2025-12-29 01:55:52.849');
INSERT INTO `refresh_tokens` VALUES ('1725d06f-0214-4a9a-8f68-21d28ef5225f', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYjcyMGQ4MC03NDIyLTQ3NjktOTBlZS1mOTE5OWYwOGJhNzAiLCJlbWFpbCI6ImFkbWluQGlsbGEtaGVscGVyLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NzA5NjI4NSwiZXhwIjoxNzY3NzAxMDg1fQ.AagT8CcM4J7Q_n12fuha-TEtUXVtyib2IT9QNTpnABs', '3b720d80-7422-4769-90ee-f9199f08ba70', '2026-01-06 12:04:45.702', '2025-12-30 12:04:45.704');
INSERT INTO `refresh_tokens` VALUES ('196dbd31-54db-48b8-8356-7c417ba8bb38', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYjcyMGQ4MC03NDIyLTQ3NjktOTBlZS1mOTE5OWYwOGJhNzAiLCJlbWFpbCI6ImFkbWluQGlsbGEtaGVscGVyLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjkyMTUyNywiZXhwIjoxNzY3NTI2MzI3fQ.Bxi0QQLWzwkyi_1JEOjIG25fbKNO-TOalG29kJpwneo', '3b720d80-7422-4769-90ee-f9199f08ba70', '2026-01-04 11:32:07.206', '2025-12-28 11:32:07.207');
INSERT INTO `refresh_tokens` VALUES ('29cbf43b-1fd5-49ad-96e0-a0fc59eb1a66', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYjcyMGQ4MC03NDIyLTQ3NjktOTBlZS1mOTE5OWYwOGJhNzAiLCJlbWFpbCI6ImFkbWluQGlsbGEtaGVscGVyLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NzAwOTQwMiwiZXhwIjoxNzY3NjE0MjAyfQ.EgncfY7_jIw_u0ii8fo6H3QBRgOhxqBYwh33N1fT0ss', '3b720d80-7422-4769-90ee-f9199f08ba70', '2026-01-05 11:56:42.509', '2025-12-29 11:56:42.512');
INSERT INTO `refresh_tokens` VALUES ('2a4e7284-94c5-4d03-94d9-a592031e4ef6', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYjcyMGQ4MC03NDIyLTQ3NjktOTBlZS1mOTE5OWYwOGJhNzAiLCJlbWFpbCI6ImFkbWluQGlsbGEtaGVscGVyLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjkxODg2MiwiZXhwIjoxNzY3NTIzNjYyfQ.QkamZQjaZyl1inZriR8uw7W-0hRhW4RoLWXPkLu48w0', '3b720d80-7422-4769-90ee-f9199f08ba70', '2026-01-04 10:47:42.478', '2025-12-28 10:47:42.479');
INSERT INTO `refresh_tokens` VALUES ('2e24fe4c-fd1a-4d21-aadb-cab940a81148', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYjcyMGQ4MC03NDIyLTQ3NjktOTBlZS1mOTE5OWYwOGJhNzAiLCJlbWFpbCI6ImFkbWluQGlsbGEtaGVscGVyLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjkyMDY1MiwiZXhwIjoxNzY3NTI1NDUyfQ.H0ZxdLQsPW8QrvovJer10A_T7TIJpjGXZOx5kUpf2HU', '3b720d80-7422-4769-90ee-f9199f08ba70', '2026-01-04 11:17:32.259', '2025-12-28 11:17:32.260');
INSERT INTO `refresh_tokens` VALUES ('3416c757-28a1-4183-a813-311259ea1af6', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYjcyMGQ4MC03NDIyLTQ3NjktOTBlZS1mOTE5OWYwOGJhNzAiLCJlbWFpbCI6ImFkbWluQGlsbGEtaGVscGVyLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjkyMDYwNywiZXhwIjoxNzY3NTI1NDA3fQ.iCZWctLO1cGoMIuuKJ1NiESuaAW16Ku3iOCV3MiTCLU', '3b720d80-7422-4769-90ee-f9199f08ba70', '2026-01-04 11:16:47.644', '2025-12-28 11:16:47.645');
INSERT INTO `refresh_tokens` VALUES ('40246d8f-8425-4f2f-a5d6-5c5c74499941', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYjcyMGQ4MC03NDIyLTQ3NjktOTBlZS1mOTE5OWYwOGJhNzAiLCJlbWFpbCI6ImFkbWluQGlsbGEtaGVscGVyLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjkxODc0MywiZXhwIjoxNzY3NTIzNTQzfQ.2j9xe1OVCANumadRgBw-mckHzyA_mqLHFgfZkUUTeqU', '3b720d80-7422-4769-90ee-f9199f08ba70', '2026-01-04 10:45:43.430', '2025-12-28 10:45:43.432');
INSERT INTO `refresh_tokens` VALUES ('40a77853-48a1-4509-ac86-09b1d616704e', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYjcyMGQ4MC03NDIyLTQ3NjktOTBlZS1mOTE5OWYwOGJhNzAiLCJlbWFpbCI6ImFkbWluQGlsbGEtaGVscGVyLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NzE0MTk1NywiZXhwIjoxNzY3NzQ2NzU3fQ.H9J-i1PeBTLB3dJSZIWDyqPOOIlHe1lOmDziveR3Nxc', '3b720d80-7422-4769-90ee-f9199f08ba70', '2026-01-07 00:45:57.656', '2025-12-31 00:45:57.659');
INSERT INTO `refresh_tokens` VALUES ('43242d0d-0b9f-4726-a48c-4d21fd3361ed', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYjcyMGQ4MC03NDIyLTQ3NjktOTBlZS1mOTE5OWYwOGJhNzAiLCJlbWFpbCI6ImFkbWluQGlsbGEtaGVscGVyLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NzE0MTkyNywiZXhwIjoxNzY3NzQ2NzI3fQ.fykujIQRp78yqdL-Q4tz8yTAFbCwdoAXua3RLBnUdPE', '3b720d80-7422-4769-90ee-f9199f08ba70', '2026-01-07 00:45:27.688', '2025-12-31 00:45:27.692');
INSERT INTO `refresh_tokens` VALUES ('4443037e-ca0a-48fb-aadf-ad27f0fbcd21', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYjcyMGQ4MC03NDIyLTQ3NjktOTBlZS1mOTE5OWYwOGJhNzAiLCJlbWFpbCI6ImFkbWluQGlsbGEtaGVscGVyLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjkyMTQ1MywiZXhwIjoxNzY3NTI2MjUzfQ.X5v30bOVrAcZtcOCqDmMscWhxtztU_jOZl46JCXFH-Y', '3b720d80-7422-4769-90ee-f9199f08ba70', '2026-01-04 11:30:53.161', '2025-12-28 11:30:53.164');
INSERT INTO `refresh_tokens` VALUES ('51f77307-f31f-412a-80dd-53dc8e194822', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYjcyMGQ4MC03NDIyLTQ3NjktOTBlZS1mOTE5OWYwOGJhNzAiLCJlbWFpbCI6ImFkbWluQGlsbGEtaGVscGVyLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjkyMTU0MCwiZXhwIjoxNzY3NTI2MzQwfQ.x2WFvGiZizp7cU1oGrBIvrPmEBYuRGyrItKtr2xQtc4', '3b720d80-7422-4769-90ee-f9199f08ba70', '2026-01-04 11:32:20.473', '2025-12-28 11:32:20.475');
INSERT INTO `refresh_tokens` VALUES ('57727e42-7cac-4453-83ef-637d480d29c1', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYjcyMGQ4MC03NDIyLTQ3NjktOTBlZS1mOTE5OWYwOGJhNzAiLCJlbWFpbCI6ImFkbWluQGlsbGEtaGVscGVyLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjkyMDYwMywiZXhwIjoxNzY3NTI1NDAzfQ.WoSJIKKTQ3CVgnA3hvncWQP6xzo02iYes8MulBIDXQg', '3b720d80-7422-4769-90ee-f9199f08ba70', '2026-01-04 11:16:43.184', '2025-12-28 11:16:43.185');
INSERT INTO `refresh_tokens` VALUES ('5ab03abf-803c-46d7-9b5c-8235b28c628f', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYjcyMGQ4MC03NDIyLTQ3NjktOTBlZS1mOTE5OWYwOGJhNzAiLCJlbWFpbCI6ImFkbWluQGlsbGEtaGVscGVyLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NzE0MTAwOCwiZXhwIjoxNzY3NzQ1ODA4fQ.c6WqUTDRuVy67e9qnoiSaisLO8ZWLONwYxY6-h8-ZWg', '3b720d80-7422-4769-90ee-f9199f08ba70', '2026-01-07 00:30:08.890', '2025-12-31 00:30:08.891');
INSERT INTO `refresh_tokens` VALUES ('5b610061-b1d7-4d75-95fc-f4b6aa6b1394', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYjcyMGQ4MC03NDIyLTQ3NjktOTBlZS1mOTE5OWYwOGJhNzAiLCJlbWFpbCI6ImFkbWluQGlsbGEtaGVscGVyLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2Njk5NDE4MSwiZXhwIjoxNzY3NTk4OTgxfQ.UdeTJt9OpZuE5P07_4U_b47H2SiK9Ad_ZpjE63ewwxA', '3b720d80-7422-4769-90ee-f9199f08ba70', '2026-01-05 07:43:01.197', '2025-12-29 07:43:01.199');
INSERT INTO `refresh_tokens` VALUES ('5d302403-dea3-4ae2-af20-f9af2b8bad5a', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYjcyMGQ4MC03NDIyLTQ3NjktOTBlZS1mOTE5OWYwOGJhNzAiLCJlbWFpbCI6ImFkbWluQGlsbGEtaGVscGVyLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2Njk4NjE1MSwiZXhwIjoxNzY3NTkwOTUxfQ._Sj2OeQD2oeS1p5mK1HQVAKP-TspRAy4sqEEDW2lfxI', '3b720d80-7422-4769-90ee-f9199f08ba70', '2026-01-05 05:29:11.367', '2025-12-29 05:29:11.368');
INSERT INTO `refresh_tokens` VALUES ('5e25c036-938f-46ad-9ad1-f2a78b223476', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYjcyMGQ4MC03NDIyLTQ3NjktOTBlZS1mOTE5OWYwOGJhNzAiLCJlbWFpbCI6ImFkbWluQGlsbGEtaGVscGVyLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NzA5Njk5MSwiZXhwIjoxNzY3NzAxNzkxfQ.M-Cn9Fz5eTH8BwtxpAUtZn4Fejoy1BnFqPRjVukFFTc', '3b720d80-7422-4769-90ee-f9199f08ba70', '2026-01-06 12:16:31.213', '2025-12-30 12:16:31.214');
INSERT INTO `refresh_tokens` VALUES ('620d25e5-2076-4539-88f0-c3202e6ab451', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYjcyMGQ4MC03NDIyLTQ3NjktOTBlZS1mOTE5OWYwOGJhNzAiLCJlbWFpbCI6ImFkbWluQGlsbGEtaGVscGVyLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NzAwNjAwMSwiZXhwIjoxNzY3NjEwODAxfQ.-dyAlb1vohj-3h9_2VtrA2l3ci7tGCw4d8-jKtfPHvs', '3b720d80-7422-4769-90ee-f9199f08ba70', '2026-01-05 11:00:01.695', '2025-12-29 11:00:01.697');
INSERT INTO `refresh_tokens` VALUES ('817ff163-6953-4653-be29-8e536fecd88e', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYjcyMGQ4MC03NDIyLTQ3NjktOTBlZS1mOTE5OWYwOGJhNzAiLCJlbWFpbCI6ImFkbWluQGlsbGEtaGVscGVyLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjkxODc0NSwiZXhwIjoxNzY3NTIzNTQ1fQ.7iNJ5mLvpLzGVIur3RxztwIZBfQzPZXb4JkWz6mO3qU', '3b720d80-7422-4769-90ee-f9199f08ba70', '2026-01-04 10:45:45.574', '2025-12-28 10:45:45.575');
INSERT INTO `refresh_tokens` VALUES ('84da9f9c-4d4e-4496-8c22-d8f4739f3677', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYjcyMGQ4MC03NDIyLTQ3NjktOTBlZS1mOTE5OWYwOGJhNzAiLCJlbWFpbCI6ImFkbWluQGlsbGEtaGVscGVyLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2Njk4NzQ5OCwiZXhwIjoxNzY3NTkyMjk4fQ.wdROpayxX6qfXY59p8Hfi3MlcWCdH45nBoxGqTbmhP4', '3b720d80-7422-4769-90ee-f9199f08ba70', '2026-01-05 05:51:38.214', '2025-12-29 05:51:38.216');
INSERT INTO `refresh_tokens` VALUES ('96017325-8652-4728-9865-3fa823f6f1e5', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYjcyMGQ4MC03NDIyLTQ3NjktOTBlZS1mOTE5OWYwOGJhNzAiLCJlbWFpbCI6ImFkbWluQGlsbGEtaGVscGVyLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjkxMzM5MiwiZXhwIjoxNzY3NTE4MTkyfQ.9Req3wjibtYWwRWwaBEZxH9hDr913rnksnzlkQ-6FYk', '3b720d80-7422-4769-90ee-f9199f08ba70', '2026-01-04 09:16:32.744', '2025-12-28 09:16:32.746');
INSERT INTO `refresh_tokens` VALUES ('98329a29-2c53-43f6-9384-eda54ae60436', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlYzQzOTY4NS1iMzNmLTQ1OWMtOTNiNC01ZGYwZDNiMDk1OWYiLCJlbWFpbCI6Imp3ZDE5ODZAMTYzLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzY3MTUwMTE1LCJleHAiOjE3Njc3NTQ5MTV9.0QhvoihX1jNN5Ujh37b55RsSIc2NXHbL3k4EL3UMdBY', 'ec439685-b33f-459c-93b4-5df0d3b0959f', '2026-01-07 03:01:55.661', '2025-12-31 03:01:55.662');
INSERT INTO `refresh_tokens` VALUES ('99b039c9-e1a5-41dc-bb53-bce1589dd1b5', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYjcyMGQ4MC03NDIyLTQ3NjktOTBlZS1mOTE5OWYwOGJhNzAiLCJlbWFpbCI6ImFkbWluQGlsbGEtaGVscGVyLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2Njk4ODUwNCwiZXhwIjoxNzY3NTkzMzA0fQ.liroJM9sHIWsAsntPGyKKKfLnbjWWxTM6vKWMrsD3js', '3b720d80-7422-4769-90ee-f9199f08ba70', '2026-01-05 06:08:24.638', '2025-12-29 06:08:24.639');
INSERT INTO `refresh_tokens` VALUES ('9c4f65c1-a458-403f-8df5-7bbdfeec3164', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYjcyMGQ4MC03NDIyLTQ3NjktOTBlZS1mOTE5OWYwOGJhNzAiLCJlbWFpbCI6ImFkbWluQGlsbGEtaGVscGVyLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjkxODQ4MSwiZXhwIjoxNzY3NTIzMjgxfQ.FRMaWVEH2WMofQX0G5Pk8heoNY45OaWCgAUmSyM_vyU', '3b720d80-7422-4769-90ee-f9199f08ba70', '2026-01-04 10:41:21.787', '2025-12-28 10:41:21.789');
INSERT INTO `refresh_tokens` VALUES ('9e415d98-2505-47b6-baeb-aeab1fbad5ab', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYjcyMGQ4MC03NDIyLTQ3NjktOTBlZS1mOTE5OWYwOGJhNzAiLCJlbWFpbCI6ImFkbWluQGlsbGEtaGVscGVyLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NzA5NTg4MCwiZXhwIjoxNzY3NzAwNjgwfQ.P49bxuC4nBDJqgvDvMILgrAOSBipEVRgRMCe_aJC4hI', '3b720d80-7422-4769-90ee-f9199f08ba70', '2026-01-06 11:58:00.225', '2025-12-30 11:58:00.226');
INSERT INTO `refresh_tokens` VALUES ('a6e06380-a481-49e9-8ade-60219dd37c2c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYjcyMGQ4MC03NDIyLTQ3NjktOTBlZS1mOTE5OWYwOGJhNzAiLCJlbWFpbCI6ImFkbWluQGlsbGEtaGVscGVyLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjkyMDc0NCwiZXhwIjoxNzY3NTI1NTQ0fQ.vVCWIg_1sjnImc3-0FPFPWNwBN1uLTBMhOivLoysgRw', '3b720d80-7422-4769-90ee-f9199f08ba70', '2026-01-04 11:19:04.945', '2025-12-28 11:19:04.946');
INSERT INTO `refresh_tokens` VALUES ('c2d17ca0-4909-4f45-9b09-a9bf4b1f75c0', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYjcyMGQ4MC03NDIyLTQ3NjktOTBlZS1mOTE5OWYwOGJhNzAiLCJlbWFpbCI6ImFkbWluQGlsbGEtaGVscGVyLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjkyMTQ2MCwiZXhwIjoxNzY3NTI2MjYwfQ.8vahVmkWnRyJuGsTwPudFBLjkhHsTiClfssJqIyuWl0', '3b720d80-7422-4769-90ee-f9199f08ba70', '2026-01-04 11:31:00.534', '2025-12-28 11:31:00.535');
INSERT INTO `refresh_tokens` VALUES ('d135abc9-a104-49e8-a433-085f78b5cc83', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlYzQzOTY4NS1iMzNmLTQ1OWMtOTNiNC01ZGYwZDNiMDk1OWYiLCJlbWFpbCI6Imp3ZDE5ODZAMTYzLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzY3MTQyMTM1LCJleHAiOjE3Njc3NDY5MzV9.pDIgVaySAo1Cff3Nh5W4zNe7G3VMVMprnambL7O5t18', 'ec439685-b33f-459c-93b4-5df0d3b0959f', '2026-01-07 00:48:55.660', '2025-12-31 00:48:55.662');
INSERT INTO `refresh_tokens` VALUES ('d5031cb3-bc8d-43f8-afc9-0524889e56c7', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYjcyMGQ4MC03NDIyLTQ3NjktOTBlZS1mOTE5OWYwOGJhNzAiLCJlbWFpbCI6ImFkbWluQGlsbGEtaGVscGVyLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2Njg5Njk5NywiZXhwIjoxNzY3NTAxNzk3fQ.3sSfdEF9h_u0nuU82cENjpm6_F2K31QDduhOMWqgrX4', '3b720d80-7422-4769-90ee-f9199f08ba70', '2026-01-04 04:43:17.149', '2025-12-28 04:43:17.151');
INSERT INTO `refresh_tokens` VALUES ('d6b417bc-4368-4e65-956c-d29b4a96630a', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYjcyMGQ4MC03NDIyLTQ3NjktOTBlZS1mOTE5OWYwOGJhNzAiLCJlbWFpbCI6ImFkbWluQGlsbGEtaGVscGVyLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NzA3MzY1OCwiZXhwIjoxNzY3Njc4NDU4fQ.lyhdgRgWV7bJJ_TdmlwACLf0Rhz0GBC5IJPN_ik_RBg', '3b720d80-7422-4769-90ee-f9199f08ba70', '2026-01-06 05:47:38.856', '2025-12-30 05:47:38.858');
INSERT INTO `refresh_tokens` VALUES ('db35ca5f-57cf-4d43-b727-11c01ff33071', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYjcyMGQ4MC03NDIyLTQ3NjktOTBlZS1mOTE5OWYwOGJhNzAiLCJlbWFpbCI6ImFkbWluQGlsbGEtaGVscGVyLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NzE0NjU2MywiZXhwIjoxNzY3NzUxMzYzfQ.c_SF-OwpkSCShvmyxauaIxnte9b5ubW0iPa_OnN_aGw', '3b720d80-7422-4769-90ee-f9199f08ba70', '2026-01-07 02:02:43.061', '2025-12-31 02:02:43.063');
INSERT INTO `refresh_tokens` VALUES ('dec37dfd-0b06-44e5-9fc0-cdbbc1c1bb45', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYjcyMGQ4MC03NDIyLTQ3NjktOTBlZS1mOTE5OWYwOGJhNzAiLCJlbWFpbCI6ImFkbWluQGlsbGEtaGVscGVyLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NzAwODQwNiwiZXhwIjoxNzY3NjEzMjA2fQ.myvcrGIeA0xlmta4vD7HCJFjnWCoAEguRgj0khN1mOs', '3b720d80-7422-4769-90ee-f9199f08ba70', '2026-01-05 11:40:06.309', '2025-12-29 11:40:06.311');
INSERT INTO `refresh_tokens` VALUES ('f5f458f8-4a2a-49a7-a13f-3bc11ccd7de3', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYjcyMGQ4MC03NDIyLTQ3NjktOTBlZS1mOTE5OWYwOGJhNzAiLCJlbWFpbCI6ImFkbWluQGlsbGEtaGVscGVyLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NzA5NjMwMiwiZXhwIjoxNzY3NzAxMTAyfQ.9rtrhzvXHbtpC9GWwBznnXWBUjN1c9z2gjUX6jLcbj4', '3b720d80-7422-4769-90ee-f9199f08ba70', '2026-01-06 12:05:02.051', '2025-12-30 12:05:02.053');
INSERT INTO `refresh_tokens` VALUES ('fb157345-52d8-4a79-9994-43cc35152665', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYjcyMGQ4MC03NDIyLTQ3NjktOTBlZS1mOTE5OWYwOGJhNzAiLCJlbWFpbCI6ImFkbWluQGlsbGEtaGVscGVyLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NzA2ODQ1NCwiZXhwIjoxNzY3NjczMjU0fQ.tY7gL7qe4xOWXdlElLbj_Xqw3GvJUhHcRtkF8f7MhyY', '3b720d80-7422-4769-90ee-f9199f08ba70', '2026-01-06 04:20:54.264', '2025-12-30 04:20:54.266');
INSERT INTO `refresh_tokens` VALUES ('fbb82906-8e1f-462c-be86-17abf3da7208', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYjcyMGQ4MC03NDIyLTQ3NjktOTBlZS1mOTE5OWYwOGJhNzAiLCJlbWFpbCI6ImFkbWluQGlsbGEtaGVscGVyLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NjkyMTI0OSwiZXhwIjoxNzY3NTI2MDQ5fQ.mTI3uNEXy4HxgQt6zXqt4rCDSzs55hMoSjxVGPQ7GV0', '3b720d80-7422-4769-90ee-f9199f08ba70', '2026-01-04 11:27:29.685', '2025-12-28 11:27:29.687');

-- ----------------------------
-- Table structure for user_streaks
-- ----------------------------
DROP TABLE IF EXISTS `user_streaks`;
CREATE TABLE `user_streaks`  (
  `user_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `current_streak` int(11) NOT NULL DEFAULT 0,
  `longest_streak` int(11) NOT NULL DEFAULT 0,
  `last_activity_date` date NULL DEFAULT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`user_id`) USING BTREE,
  CONSTRAINT `user_streaks_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_streaks
-- ----------------------------
INSERT INTO `user_streaks` VALUES ('2c728d67-cbed-446a-bd38-189e6cb24968', 0, 0, NULL, '2025-12-28 03:18:05');
INSERT INTO `user_streaks` VALUES ('3b720d80-7422-4769-90ee-f9199f08ba70', 1, 9, '2025-12-29', '2025-12-30 00:03:28');
INSERT INTO `user_streaks` VALUES ('ec439685-b33f-459c-93b4-5df0d3b0959f', 0, 0, NULL, '2025-12-31 00:48:55');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar_url` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `subscription_tier` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'free',
  `role` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `status` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `last_login_at` datetime(3) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `users_email_key`(`email`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES ('2c728d67-cbed-446a-bd38-189e6cb24968', 'demo@illa-helper.com', '$2a$12$UrIMIRlnZemPf0AOL0paGu2FV922ZUSBjNuWudWNm.Ld3QaN17Zam', 'Demo User', NULL, 'free', 'user', 'active', '2025-12-28 03:18:04.479', '2025-12-28 03:18:04.479', NULL);
INSERT INTO `users` VALUES ('3b720d80-7422-4769-90ee-f9199f08ba70', 'admin@illa-helper.com', '$2a$12$0cGcGIeH5t6fYPxlqsSRUOrF8yoaTEjbTFde9hyzjZneAR8jk9B9S', 'Admin', NULL, 'premium', 'admin', 'active', '2025-12-28 03:18:02.407', '2025-12-31 01:19:53.407', '2025-12-31 01:19:53.394');
INSERT INTO `users` VALUES ('ec439685-b33f-459c-93b4-5df0d3b0959f', 'jwd1986@163.com', '$2a$12$UhS4kZQt.n2KO8kqkRtQzOzgXcGfOaaUfaBTTDR1GKv9.R/v9qrdW', 'jwdstef', NULL, 'free', 'user', 'active', '2025-12-31 00:48:55.007', '2025-12-31 00:56:33.015', '2025-12-31 00:56:33.013');

-- ----------------------------
-- Table structure for vocabulary_list_words
-- ----------------------------
DROP TABLE IF EXISTS `vocabulary_list_words`;
CREATE TABLE `vocabulary_list_words`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `list_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `word_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `added_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `vocabulary_list_words_list_id_word_id_key`(`list_id`, `word_id`) USING BTREE,
  INDEX `vocabulary_list_words_list_id_idx`(`list_id`) USING BTREE,
  INDEX `vocabulary_list_words_word_id_idx`(`word_id`) USING BTREE,
  CONSTRAINT `vocabulary_list_words_list_id_fkey` FOREIGN KEY (`list_id`) REFERENCES `vocabulary_lists` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `vocabulary_list_words_word_id_fkey` FOREIGN KEY (`word_id`) REFERENCES `favorite_words` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of vocabulary_list_words
-- ----------------------------

-- ----------------------------
-- Table structure for vocabulary_lists
-- ----------------------------
DROP TABLE IF EXISTS `vocabulary_lists`;
CREATE TABLE `vocabulary_lists`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `color` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '#3b82f6',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `vocabulary_lists_user_id_name_key`(`user_id`, `name`) USING BTREE,
  INDEX `vocabulary_lists_user_id_idx`(`user_id`) USING BTREE,
  CONSTRAINT `vocabulary_lists_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of vocabulary_lists
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;
