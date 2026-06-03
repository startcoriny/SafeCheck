### 에러코드

| 에러코드 | 에러메시지                                       | 설명                               |
| -------- | ------------------------------------------------ | ---------------------------------- |
| 01       | APPLICATION ERROR                                | 어플리케이션 에러                  |
| 02       | TIMEOUT ERROR                                    | 요청시간초과 에러                  |
| 10       | INVALID_REQUEST_PARAMETER_ERROR                  | 잘못된 요청 파라메터 에러          |
| 11       | INDENT REQUEST PARAMETER ERROR                   | 필수 파라메터 에러                 |
| 12       | NO OPENAPI SERVICE ERROR                         | 해당 오픈API서비스가 없거나 폐기됨 |
| 13       | INVALID METHOD REQUEST ERROR                     | 잘못된 메소드 요청                 |
| 20       | SERVICE ACCESS DENIED ERROR                      | 서비스 접근거부                    |
| 22       | LIMITED NUMBER OF SERVICE REQUESTS EXCEEDS ERROR | 서비스 요청제한횟수 초과           |
| 30       | SERVICE KEY IS NOT REGISTERED ERROR              | 등록되지 않은 서비스키             |
| 31       | DEADLINE HAS EXPIRED ERROR                       | 기한만료된 서비스키                |
| 32       | UNREGISTERED IP ERROR                            | 등록되지 않은 IP                   |
| 33       | NO SERVICE KEY ERROR                             | 서비스키가 없음                    |
| 34       | DOZEN SERVICE KEY ERROR                          | 여러개의 서비스키                  |
| 99       | UNKNOWN ERROR                                    | 기타에러                           |

### **요청변수(Request Parameter)**

| 항목명(국문)       | 항목명(영문) | 타입    | 항목크기 | 항목구분 | 항목설명           |
| ------------------ | ------------ | ------- | -------- | -------- | ------------------ |
| 서비스키           | serviceKey   | STRING  | 50       | Y        | 서비스키           |
| 페이지당개수       | numOfRows    | NUMBER  | 30       | N        | 페이지당개수       |
| 페이지번호         | pageNo       | NUMBER  | 30       | N        | 페이지번호         |
| 응답타입(json,xml) | returnType   | VARCHAR | 30       | N        | 응답타입(json,xml) |

### **출력결과(Response Element)**

| 항목명(국문)     | 항목명(영문) | 타입 | 항목크기 | 항목구분 | 항목설명         |
| ---------------- | ------------ | ---- | -------- | -------- | ---------------- |
| 연합뉴스번호     | YNA_NO       |      | 22       | Y        | 연합뉴스번호     |
| 연합뉴스제목     | YNA_TTL      |      | 1000     | Y        | 연합뉴스제목     |
| 연합뉴스작성자명 | YNA_WRTR_NM  |      | 200      | Y        | 연합뉴스작성자명 |
| 팀명             | TEAM_NM      |      | 300      | Y        | 팀명             |
| 연합뉴스등록일시 | YNA_REG_YMD  |      | 50       | Y        | 연합뉴스등록일시 |
| 생성일시         | CRT_DT       |      | 50       | Y        | 생성일시         |
| 노출여부         | EXPSR_YN     |      | 1        | Y        | 노출여부         |
| 알람여부         | ALRM_YN      |      | 1        | Y        | 알람여부         |
| 삭제여부         | DEL_YN       |      | 1        | Y        | 삭제여부         |
| 연합뉴스내용     | YNA_CN       |      | 6000     | Y        | 연합뉴스내용     |
